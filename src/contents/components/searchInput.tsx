import { forwardRef } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}

// 部分网站的特殊快捷键过滤掉
const spKeys = ['s']

// 功能按键过滤掉
const fnKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>((props, ref) => {
  const { value, onChange } = props

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (spKeys.includes(e.key)) {
      onChange(`${value}${e.key}`)
      e.preventDefault()
      e.stopPropagation()
    }

    if (fnKeys.includes(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <input
      ref={ref}
      className="w-full h-12 rounded-xl text-lg outline-none border-none focus:ring-0 shadow-none placeholder-gray-400 px-3"
      style={{ boxShadow: 'none', border: 'none' }}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="搜索标签页、历史、书签..."
      autoFocus
    />
  )
})

SearchInput.displayName = 'SearchInput'

export default SearchInput
