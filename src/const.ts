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
