import { forwardRef } from 'react'

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
  )
})

SearchInput.displayName = 'SearchInput'

export default SearchInput
