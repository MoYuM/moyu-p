import { forwardRef } from 'react'
import { Key } from '../../key'
import HotkeyIcon from './hotkeyIcon'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>((props, ref) => {
  const { value, onChange } = props

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 允许通过 onChange 更新值，但阻止事件冒泡
    onChange(e.target.value)
    e.stopPropagation()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 只阻止可能干扰输入的事件，允许快捷键正常工作
    const key = e.key.toLowerCase()

    // 只阻止这些可能干扰输入的事件
    const inputInterferenceKeys = [
      'backspace',
      'delete',
      'tab',
      'home',
      'end',
      'pageup',
      'pagedown',
    ]

    // 阻止文本编辑相关的组合键
    const isTextEditCombo = (e.ctrlKey || e.metaKey)
      && ['a', 'c', 'v', 'x', 'z', 'y'].includes(key)

    // 如果是输入干扰按键或文本编辑组合键，阻止冒泡
    if (inputInterferenceKeys.includes(key) || isTextEditCombo) {
      e.stopPropagation()
    }
    // 其他按键（包括快捷键）允许冒泡
  }

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleCompositionStart = (e: React.CompositionEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleCompositionUpdate = (e: React.CompositionEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="flex items-center gap-1 w-full px-3">
      <input
        ref={ref}
        tabIndex={-1}
        className="w-full h-12 rounded-xl text-lg outline-none border-none focus:ring-0 shadow-none placeholder-gray-400 dark:placeholder-gray-500 bg-transparent text-gray-900 dark:text-gray-100"
        style={{ boxShadow: 'none', border: 'none' }}
        value={value}
        onChange={handleChange}
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onCompositionUpdate={handleCompositionUpdate}
        onKeyDown={handleKeyDown}
        placeholder="搜索标签页、历史、书签..."
        autoFocus
      />
      <div className="flex items-center text-gray-400 dark:text-gray-500 gap-2">
        <span>Google</span>
        <HotkeyIcon keys={[Key.Shift, Key.Enter]} />
      </div>
    </div>
  )
})

SearchInput.displayName = 'SearchInput'

export default SearchInput
