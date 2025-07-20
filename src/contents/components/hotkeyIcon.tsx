import React from 'react'
import { Key } from '../../key'

interface HotkeyIconProps {
  keys: string | string[]
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// 快捷键图标映射
const keyIcons: Record<string, string> = {
  // 修饰键
  [Key.Control]: '⌃',
  [Key.Meta]: '⌘',
  [Key.Alt]: '⌥',
  [Key.Shift]: '⇧',

  // 功能键
  [Key.Enter]: '↵',
  [Key.Escape]: '⎋',
  [Key.Tab]: '⇥',
  ' ': '␣', // Space
  [Key.Backspace]: '⌫',
  [Key.Delete]: '⌦',

  // 方向键
  [Key.ArrowUp]: '↑',
  [Key.ArrowDown]: '↓',
  [Key.ArrowLeft]: '←',
  [Key.ArrowRight]: '→',

  // 其他常用键
  [Key.Home]: '⇱',
  [Key.End]: '⇲',
  [Key.PageUp]: '⇞',
  [Key.PageDown]: '⇟',

  // 功能键 F1-F12
  [Key.F1]: 'F1',
  [Key.F2]: 'F2',
  [Key.F3]: 'F3',
  [Key.F4]: 'F4',
  [Key.F5]: 'F5',
  [Key.F6]: 'F6',
  [Key.F7]: 'F7',
  [Key.F8]: 'F8',
  [Key.F9]: 'F9',
  [Key.F10]: 'F10',
  [Key.F11]: 'F11',
  [Key.F12]: 'F12',

  // 数字键
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',

  // 字母键
  'a': 'A',
  'b': 'B',
  'c': 'C',
  'd': 'D',
  'e': 'E',
  'f': 'F',
  'g': 'G',
  'h': 'H',
  'i': 'I',
  'j': 'J',
  'k': 'K',
  'l': 'L',
  'm': 'M',
  'n': 'N',
  'o': 'O',
  'p': 'P',
  'q': 'Q',
  'r': 'R',
  's': 'S',
  't': 'T',
  'u': 'U',
  'v': 'V',
  'w': 'W',
  'x': 'X',
  'y': 'Y',
  'z': 'Z',

  // 特殊字符
  '+': '+',
  '-': '-',
  '=': '=',
  '/': '/',
  '\\': '\\',
  '[': '[',
  ']': ']',
  '{': '{',
  '}': '}',
  '|': '|',
  ';': ';',
  ':': ':',
  '\'': '\'',
  '"': '"',
  ',': ',',
  '.': '.',
  '<': '<',
  '>': '>',
  '?': '?',
  '~': '~',

  // 其他常用键
  [Key.Insert]: 'Ins',
  [Key.PrintScreen]: 'PrtSc',
  [Key.ScrollLock]: 'ScrLk',
  [Key.Pause]: 'Pause',
  [Key.NumLock]: 'Num',
  [Key.CapsLock]: 'Caps',
}

// 大小样式映射
const sizeStyles = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-1 py-0.5',
  lg: 'text-base px-2.5 py-1.5',
}

const HotkeyIcon: React.FC<HotkeyIconProps> = ({
  keys,
  className = '',
  size = 'md',
}) => {
  // 处理输入，支持字符串或数组
  const keyArray = Array.isArray(keys) ? keys : keys.split('+')

  // 获取键的显示文本
  const getKeyDisplay = (key: string): string => {
    return keyIcons[key] || key.toUpperCase()
  }

  return (
    <kbd
      className={`
        inline-flex items-center gap-1
        border border-gray-300 dark:border-gray-600 rounded font-sans 
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {keyArray.map((key, index) => (
        <span
          key={index}
          className="text-gray-400 dark:text-gray-500"
          // className={isModifierKey(key) ? 'text-gray-600' : 'text-gray-800'}
        >
          {getKeyDisplay(key)}
        </span>
      ))}
    </kbd>
  )
}

export default HotkeyIcon
