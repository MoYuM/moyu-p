import { t } from '~utils/i18n'

export enum MESSAGE_ENUM {
  /**
   * 打开弹窗
   */
  OPEN_POPUP = 'OPEN_POPUP',
}

// 快捷键常量
export const KEYS = {
  // 导航键
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',

  // 功能键
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  TAB: 'Tab',

  // 组合键
  CTRL_P: 'ctrl+p',
  CTRL_N: 'ctrl+n',
  CTRL_F: 'ctrl+f',
  CTRL_S: 'ctrl+s',
  CTRL_A: 'ctrl+a',
  CTRL_Z: 'ctrl+z',

  // 其他
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const

// 类型定义
export type KeyType = typeof KEYS[keyof typeof KEYS]

/**
 * 禁止冒泡的键
 */
export const NORMAL_KEYS = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
]

/**
 * 搜索引擎选项
 */
export const SEARCH_ENGINE_OPTIONS = [
  { label: 'Google', value: 'google' },
  { label: 'Bing', value: 'bing' },
  { label: 'Baidu', value: 'baidu' },
]

export const APPEARANCE_OPTIONS = [
  { label: t('configAppearanceSystem'), value: 'system' },
  { label: t('configAppearanceLight'), value: 'light' },
  { label: t('configAppearanceDark'), value: 'dark' },
]
