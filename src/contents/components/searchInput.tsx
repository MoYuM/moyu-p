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
    onChange(e.target.value)
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={ref}
        tabIndex={-1}
        className="w-full h-12 rounded-xl text-lg outline-none border-none focus:ring-0 shadow-none placeholder-gray-400 px-3"
        style={{ boxShadow: 'none', border: 'none' }}
        value={value}
        onChange={handleChange}
        placeholder="搜索标签页、历史、书签..."
        autoFocus
      />
      <div className="flex items-center text-gray-400 gap-2">
        <span>Google</span>
        <HotkeyIcon keys={[Key.Shift, Key.Enter]} />
      </div>
    </div>
  )
})

SearchInput.displayName = 'SearchInput'

export default SearchInput
