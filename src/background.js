import * as types from './utils/action-types';

chrome.commands.onCommand.addListener(command => {
  if (command === types.CMD_QUIP_ZEN_MODE) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(tabs[0].id, { action: types.CMD_QUIP_ZEN_MODE }, response => {
        console.log(response);
      });
    });
  }
});
