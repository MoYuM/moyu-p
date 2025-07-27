import { forwardRef } from 'react'
import { NORMAL_KEYS, SEARCH_ENGINE_OPTIONS } from '~const'
import { useUserOptions } from '~store/options'
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

  const [userOptions] = useUserOptions()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 允许通过 onChange 更新值，但阻止事件冒泡
    onChange(e.target.value)
    e.stopPropagation()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key.toLowerCase()

    if (NORMAL_KEYS.includes(key)) {
      e.stopPropagation()
    }
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

  const searchEngineName = SEARCH_ENGINE_OPTIONS.find(item => item.value === userOptions?.searchEngine)?.label

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
      />
      <div className="flex items-center text-gray-400 dark:text-gray-500 gap-2">
        <span>{searchEngineName}</span>
        <HotkeyIcon keys={[Key.Shift, Key.Enter]} />
      </div>
    </div>
  )
})

SearchInput.displayName = 'SearchInput'

export default SearchInput
