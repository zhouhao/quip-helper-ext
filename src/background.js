import * as types from './utils/action-types';
import * as httpUtils from './utils/httpUtils';
import { login, signup, emailVerify, fetchAllMyNotes } from './utils/httpUtils';
import { getSanitizedUrl } from './utils/urls';
import { removeScriptTags } from './utils/base';
import { defaultColor } from './utils/color';
import { nanoid } from 'nanoid';

global.browser = require('webextension-polyfill');

const askLogin = (tab, iconClick = false) => {
  chrome.tabs.sendMessage(tab.id, { action: types.SHOW_SIDE_BAR, sub_action: types.SHOW_LOGIN, iconClick: iconClick, data: [] }, response => {
    console.log(response);
  });
};

const getNotes = (tab, actionType, iconClick = false) => {
  const url = getSanitizedUrl(tab.url);
  httpUtils
    .fetchAllMyNotesByUrl(url)
    .then(notes => {
      chrome.tabs.sendMessage(tab.id, { action: actionType, iconClick: iconClick, data: notes }, response => {
        console.log(response);
      });
    })
    .catch(() => {
      // Login is required here when action is show sidebar.
      if (actionType === types.SHOW_SIDE_BAR) {
        askLogin(tab, iconClick);
      }
    });
};

chrome.runtime.onInstalled.addListener(() => {
  const parentId = 'noteforce-parent';
  chrome.contextMenus.create({ title: 'NoteForce', id: parentId, contexts: ['all'] });

  chrome.contextMenus.create({
    title: 'Annotate in Noteforce',
    id: types.NOTEFORCE_RIGHT_CLICK_MENU_ID,
    parentId: parentId,
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    title: 'Open Notes Dashboard',
    id: types.OPEN_NOTES_MENU_ID,
    parentId: parentId,
    contexts: ['all'],
  });
  chrome.contextMenus.create({
    title: 'Open One Tab Dashboard',
    id: types.OPEN_ONE_TAB_MENU_ID,
    parentId: parentId,
    contexts: ['all'],
  });
  chrome.contextMenus.create({
    title: 'Save All Tabs in Current Window',
    id: types.SAVE_TABS_MENU_ID,
    parentId: parentId,
    contexts: ['all'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === types.NOTEFORCE_RIGHT_CLICK_MENU_ID) {
    httpUtils
      .isLoggedIn()
      .then(res => {
        console.log('NOTEFORCE_RIGHT_CLICK_MENU_ID', JSON.stringify(res));
        chrome.tabs.sendMessage(tab.id, { action: types.RIGHT_CLICK }, response => {
          console.log(response);
        });
      })
      .catch(() => {
        // Ask for login first.
        askLogin(tab);
      });
  } else if (info.menuItemId === types.OPEN_ONE_TAB_MENU_ID) {
    window.open(chrome.runtime.getURL('/options/onetab.html'));
  } else if (info.menuItemId === types.SAVE_TABS_MENU_ID) {
    chrome.tabs.query({ currentWindow: true }, tabs => {
      const allTabs = [];
      tabs.forEach(tab => {
        allTabs.push({
          id: nanoid(),
          url: tab.url,
          title: tab.title,
          ts: new Date().getTime(),
        });
      });

      chrome.storage.local.get(['tabs'], function(preTabs) {
        let result = [];
        if (preTabs && preTabs.tabs && preTabs.tabs.length > 0) {
          result = [...preTabs.tabs];
        }
        result = [...result, ...allTabs];
        chrome.storage.local.set({ tabs: result }, function() {
          console.log('There are ' + result.length + ' tabs now.');
        });
      });
      tabs.forEach(tab => chrome.tabs.remove(tab.id));
    });
  } else if (info.menuItemId === types.OPEN_NOTES_MENU_ID) {
    chrome.runtime.openOptionsPage();
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.toLowerCase().startsWith('http')) {
    getNotes(tab, types.HIGHLIGHT_ALL);
  }
});

chrome.browserAction.onClicked.addListener(tab => {
  getNotes(tab, types.SHOW_SIDE_BAR, true);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // console.log('request received:', JSON.stringify(request));

  if (request.action === types.ADD_NOTE) {
    const pa = request.pageAnnotation;
    const pageAnnotation = {
      text: pa.text,
      note: removeScriptTags(pa.note),
      highlight_color: pa.highlightColor || defaultColor,
      is_page_only: pa.isPageOnly || false,
      url: getSanitizedUrl(sender.tab.url),
    };
    httpUtils
      .savePageAnnotation(pageAnnotation)
      .then(res => {
        console.log('save new page annotation successfully!');
        getNotes(sender.tab, types.SHOW_SIDE_BAR);
        sendResponse({ done: true });
      })
      .catch(err => {
        console.error(err);
        sendResponse({ done: false, message: err });
      });
  }

  if (request.action === types.UPDATE_NOTE) {
    const pa = request.pageAnnotation;
    const pageAnnotation = {
      id: pa.id,
      text: pa.text,
      note: removeScriptTags(pa.note),
      highlight_color: pa.highlightColor || defaultColor,
    };
    httpUtils
      .updatePageAnnotation(pageAnnotation)
      .then(res => {
        console.log('Page annotation is updated successfully!');
        sendResponse({ done: true });
      })
      .catch(err => {
        console.error(err);
        sendResponse({ done: false, message: err });
      });
  }

  if (request.action === types.DELETE_NOTE) {
    httpUtils
      .deletePageAnnotation(request.id)
      .then(res => {
        console.log('Page annotation is deleted successfully!');
        sendResponse({ done: true });
      })
      .catch(err => {
        console.error(err);
        sendResponse({ done: false, message: err });
      });
  }

  if (request.action === types.LOGIN) {
    login(request.user.username, request.user.password)
      .then(() => {
        console.log('Login succeed');
        getNotes(sender.tab, types.SHOW_SIDE_BAR);
        sendResponse({ done: true });
      })
      .catch(e => {
        console.error(e);
        sendResponse({ done: false, message: e });
      });
  }

  if (request.action === types.LOGOUT) {
    chrome.storage.local.clear(() => {
      sendResponse({ done: true });
    });
  }

  if (request.action === types.VERIFY_EMAIL) {
    emailVerify(request.email)
      .then(() => {
        sendResponse({ done: true });
      })
      .catch(e => {
        console.error(e);
        sendResponse({ done: false, message: e });
      });
  }

  if (request.action === types.SIGNUP) {
    signup(request.user.username, request.user.email, request.user.password, request.user.token)
      .then(() => {
        console.log('sign up succeed');
        getNotes(sender.tab, types.SHOW_SIDE_BAR);
        sendResponse({ done: true });
      })
      .catch(e => {
        console.error(e);
        sendResponse({ done: false, message: e });
      });
  }

  if (request.action === types.SEARCH) {
    fetchAllMyNotes(request.keyword)
      .then(notes => {
        sendResponse(notes);
      })
      .catch(e => {
        console.error(e);
        sendResponse({ done: false, message: e });
      });
  }
  return true;
});

chrome.commands.onCommand.addListener(command => {
  if (command === types.CMD_HIGHLIGHT_TOGGLE) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: types.CMD_HIGHLIGHT_TOGGLE }, response => {
        console.log(response);
      });
    });
  } else if (command === types.CMD_OPEN_OPTIONS_PAGE) {
    chrome.runtime.openOptionsPage(() => console.log('Options page is opened'));
  } else if (command === types.CMD_QUIP_ZEN_MODE) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: types.CMD_QUIP_ZEN_MODE }, response => {
        console.log(response);
      });
    });
  } else if (command === types.CMD_GLOBAL_SEARCH) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: types.CMD_GLOBAL_SEARCH }, response => {
        console.log(response);
      });
    });
  }
});
