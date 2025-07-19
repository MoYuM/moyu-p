import clsx from 'clsx'
import { useEffect, useRef } from 'react'

import FaviconImg from './faviconImg'

// 搜索结果类型
interface SearchResult {
  type: 'tab' | 'history' | 'bookmark'
  id: string
  title: string
  url: string
  lastAccessed?: number
  lastVisitTime?: number
  dateAdded?: number
  favicon?: string
  faviconDataUrl?: string
}

interface SearchResultListProps {
  list: SearchResult[]
  activeIndex: number
  isKeyboardNav: boolean
  onItemClick: (item: SearchResult) => void
  onItemHover: (index: number) => void
  onMouseDown: () => void
}

function SearchResultList({
  list,
  activeIndex,
  isKeyboardNav,
  onItemClick,
  onItemHover,
  onMouseDown,
}: SearchResultListProps) {
  // 每个结果项的ref
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  // activeIndex 变化时自动滚动到可见
  useEffect(() => {
    if (itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'instant',
      })
    }
  }, [activeIndex])

  // 根据搜索结果类型获取图标
  const getResultIcon = (item: SearchResult) => {
    switch (item.type) {
      case 'tab':
        return <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs">T</div>
      case 'history':
        return <div className="w-4 h-4 bg-gray-500 rounded-sm flex items-center justify-center text-white text-xs">H</div>
      case 'bookmark':
        return <div className="w-4 h-4 bg-yellow-500 rounded-sm flex items-center justify-center text-white text-xs">B</div>
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-sm flex items-center justify-center text-white text-xs">?</div>
    }
  }

  return (
    <div className="flex flex-col gap-1 mt-2 overflow-y-auto rounded-xl bg-white max-h-96 min-h-12">
      {list?.map((item, index) => (
        <div
          key={item.id}
          ref={el => itemRefs.current[index] = el}
          className={clsx(
            'flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer',
            index === activeIndex ? 'bg-gray-200' : 'hover:bg-gray-100',
          )}
          onClick={() => onItemClick(item)}
          onMouseOver={() => {
            // 只有鼠标导航时才允许 setActiveIndex
            if (!isKeyboardNav)
              onItemHover(index)
          }}
          onMouseDown={onMouseDown}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <FaviconImg url={item.favicon} />
            <div className="truncate flex-1 text-base font-medium">{item.title}</div>
            {/* 类型图标 */}
            {getResultIcon(item)}
          </div>
          {/* 快捷键占位 */}
          {/* <div className="text-xs text-gray-400 w-12 text-right select-none">⌘1</div> */}
        </div>
      ))}
    </div>
  )
}

export default SearchResultList
export type { SearchResult }
