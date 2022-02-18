import * as types from './utils/action-types';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: 'Toggle Zen Mode',
    id: types.MENU_QUIP_ZEN_MODE,
    contexts: ['all'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === types.MENU_QUIP_ZEN_MODE) {
    toggleZenMode();
  }
});

chrome.commands.onCommand.addListener(command => {
  if (command === types.CMD_QUIP_ZEN_MODE) {
    toggleZenMode();
  }
});

const toggleZenMode = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { action: types.CMD_QUIP_ZEN_MODE }, response => {
      console.log(response);
    });
  });
};
