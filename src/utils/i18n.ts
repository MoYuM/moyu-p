/**
 * 获取国际化消息
 * @param key 消息键
 * @returns 国际化后的消息
 */
export function t(key: string): string {
  return chrome.i18n.getMessage(key) || ''
}
