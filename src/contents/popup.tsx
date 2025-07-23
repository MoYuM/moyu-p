import { sendToBackground } from '@plasmohq/messaging'
import { useMessage } from '@plasmohq/messaging/hook'
import clsx from 'clsx'
import cssText from 'data-text:~style.css'
import Fuse from 'fuse.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import Bookmark from 'react:/assets/bookmark.svg'
import Box from 'react:/assets/box.svg'
import Clock from 'react:/assets/clock.svg'

import { MESSAGE_ENUM } from '../const'
import { Key } from '../key'

import FaviconImg from './components/faviconImg'
import SearchInput from './components/searchInput'

const IconMap = {
  tab: Box,
  history: Clock,
  bookmark: Bookmark,
}

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
  titlePinyin?: string
  titlePinyinInitials?: string
}

export function getStyle() {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

const { ArrowUp, ArrowDown, Enter, Escape, Shift } = Key

const { OPEN_POPUP } = MESSAGE_ENUM

function Popup() {
  const [open, setOpen] = useState(false)
  const [list, setList] = useState<SearchResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  // 新增：区分键盘/鼠标导航
  const [isKeyboardNav, setIsKeyboardNav] = useState(true)
  // 新增：本地搜索相关状态
  const [allData, setAllData] = useState<SearchResult[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const isMoved = useRef(false)
  // 新增：每个结果项的ref
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  // 新增：Fuse搜索实例（使用预生成索引）
  const fuseRef = useRef<Fuse<SearchResult> | null>(null)

  useMessage(({ name }) => {
    if (!open && name === OPEN_POPUP) {
      handleOpen()
    }
    if (open && name === OPEN_POPUP) {
      setActiveIndex(prev => (prev + 1) % list.length)
    }
  })

  // 新增：本地搜索函数
  const performLocalSearch = useCallback((keyword: string) => {
    if (!keyword) {
      // 无关键词时返回最近使用的数据
      const sortedData = [...allData].sort((a, b) => {
        const aTime = a.lastAccessed || a.lastVisitTime || a.dateAdded || 0
        const bTime = b.lastAccessed || b.lastVisitTime || b.dateAdded || 0
        return bTime - aTime
      })
      setList(sortedData.slice(0, 6))
      return
    }

    if (!fuseRef.current)
      return

    const searchResults = fuseRef.current.search(keyword)
    const deduped: SearchResult[] = []
    const seenTitle = new Set<string>()

    for (const { item } of searchResults) {
      const title = item.title || item.url
      if (!seenTitle.has(title)) {
        seenTitle.add(title)
        deduped.push(item)
      }
    }

    // 排序：tab/history按时间，书签永远排最后
    const tabAndHistory = deduped.filter(i => i.type !== 'bookmark')
    const bookmarksOnly = deduped.filter(i => i.type === 'bookmark')
    const sortedTabAndHistory = tabAndHistory.sort((a, b) => {
      const aTime = a.lastAccessed || a.lastVisitTime || a.dateAdded || 0
      const bTime = b.lastAccessed || b.lastVisitTime || b.dateAdded || 0
      return bTime - aTime
    })
    const sortedResults = [...sortedTabAndHistory, ...bookmarksOnly]

    setList(sortedResults.slice(0, 50))
  }, [allData])

  // 新增：搜索内容变化时立即执行本地搜索
  useEffect(() => {
    if (isDataLoaded) {
      performLocalSearch(searchQuery)
    }
  }, [searchQuery, isDataLoaded, performLocalSearch])

  // 新增：搜索内容变化时，activeIndex 归零
  useEffect(() => {
    setActiveIndex(0)
  }, [searchQuery])

  // 新增：activeIndex 变化时自动滚动到可见
  useEffect(() => {
    if (itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'instant',
      })
    }
  }, [activeIndex])

  // -------- handler --------

  const handleDirectSearch = () => {
    sendToBackground({
      name: 'new-tab',
      body: { url: `https://www.google.com/search?q=${searchQuery}` },
    })
    handleClose()
  }

  const handlePrev = () => {
    setIsKeyboardNav(true)
    setActiveIndex(prev => (prev - 1 + list.length) % list.length)
  }

  const handleNext = () => {
    setIsKeyboardNav(true)
    setActiveIndex(prev => (prev + 1) % list.length)
  }

  const handleOpen = async () => {
    setOpen(true)
    await loadAllData()
    inputRef.current?.focus()
  }

  const handleClose = () => {
    setOpen(false)
    setSearchQuery('')
    setActiveIndex(0)
    setList([])
    isMoved.current = false
  }

  // 新增：加载所有数据并初始化搜索
  const loadAllData = async () => {
    if (isDataLoaded)
      return

    const { results, fuseIndex } = await sendToBackground({
      name: 'get-all',
      body: { forceRefresh: false },
    })

    // 数据已经包含拼音信息，无需再次处理
    setAllData(results)

    // 使用预生成的索引初始化Fuse搜索实例
    const fuseOptions = {
      includeScore: true,
      threshold: 0.3,
      keys: [
        'title',
        'url',
        'titlePinyin',
        'titlePinyinInitials',
      ],
    }

    if (fuseIndex) {
      // 使用预生成的索引
      const parsedIndex = Fuse.parseIndex(fuseIndex)
      fuseRef.current = new Fuse<SearchResult>(results, fuseOptions, parsedIndex)
    }
    else {
      // 降级到自动索引（如果background没有提供索引）
      fuseRef.current = new Fuse<SearchResult>(results, fuseOptions)
    }

    setIsDataLoaded(true)
    // 初始显示最近使用的数据
    performLocalSearch('')
  }

  const handleOpenResult = (item?: SearchResult) => {
    const res = item || list[activeIndex]
    sendToBackground({
      name: 'open-result',
      body: res,
    })
    handleClose()
  }

  // -------- 快捷键 --------

  useHotkeys(Escape, handleClose, {
    enabled: open,
    preventDefault: true,
    enableOnFormTags: true,
    description: '关闭搜索框',
  })

  useHotkeys(ArrowDown, handleNext, {
    enabled: open,
    preventDefault: true,
    enableOnFormTags: true,
    description: '选择下一个结果',
  })

  useHotkeys(ArrowUp, handlePrev, {
    enabled: open,
    preventDefault: true,
    enableOnFormTags: true,
    description: '选择上一个结果',
  })

  useHotkeys(Enter, () => handleOpenResult(), {
    enabled: open,
    preventDefault: true,
    enableOnFormTags: true,
    description: '打开选中结果',
  })

  useHotkeys(`${Shift}+${Enter}`, handleDirectSearch, {
    enabled: open,
    preventDefault: true,
    enableOnFormTags: true,
    description: '直接使用搜索引擎搜索关键词',
  })

  // Ctrl+P 快捷键处理
  useHotkeys('ctrl+p', () => {
    if (!open) {
      handleOpen()
    }
    else {
      isMoved.current = true
      handleNext()
    }
  }, { enableOnFormTags: true })

  // Ctrl+P 释放时处理
  useHotkeys('ctrl+p', () => {
    if (isMoved.current) {
      handleOpenResult(list[activeIndex])
    }
  }, { keyup: true, enabled: open, enableOnFormTags: true })

  // 根据搜索结果类型获取图标
  const getResultIcon = (item: SearchResult) => {
    const Icon = IconMap[item.type]
    if (Icon) {
      return <Icon className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
    }
  }

  return (
    <div
      className="fixed left-0 top-0 w-screen h-screen z-[9999]"
      style={{ display: open ? 'block' : 'none' }}
      onClick={handleClose}
    >
      <div
        className={`
          absolute left-1/2 top-1/4 -translate-x-1/2 w-[700px] p-2 flex flex-col gap-2 rounded-2xl shadow-2xl ${open ? 'block' : 'hidden'}
          bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700
        `}
        onClick={e => e.stopPropagation()}
      >
        <SearchInput
          ref={inputRef}
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <div className="flex flex-col gap-1 mt-2 overflow-y-auto rounded-xl max-h-96 min-h-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {list?.map((item, index) => (
            <div
              key={item.id}
              ref={el => itemRefs.current[index] = el}
              className={clsx(
                'flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer',
                index === activeIndex
                  ? 'bg-zinc-200 dark:bg-zinc-700'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-700',
              )}
              onClick={() => handleOpenResult(item)}
              onMouseOver={() => {
                // 只有鼠标导航时才允许 setActiveIndex
                if (!isKeyboardNav)
                  setActiveIndex(index)
              }}
              onMouseDown={() => setIsKeyboardNav(false)}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FaviconImg favicon={item.favicon} url={item.url} />
                <div className="truncate flex-1 text-base font-medium text-zinc-900 dark:text-zinc-100">{item.title}</div>
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-400 select-none">
                {getResultIcon(item)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Popup
