import { MESSAGE_ENUM } from "./const";

const {OPEN_POPUP} = MESSAGE_ENUM;

// 监听扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    // 向当前标签页发送消息
    chrome.tabs.sendMessage(tab.id, { name: OPEN_POPUP })
  }
}) 