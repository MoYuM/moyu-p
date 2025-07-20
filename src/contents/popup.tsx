import { sendToBackground } from '@plasmohq/messaging'
import { useMessage } from '@plasmohq/messaging/hook'
import clsx from 'clsx'
import cssText from 'data-text:~style.css'
import debouncePromise from 'debounce-promise'
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

  const inputRef = useRef<HTMLInputElement>(null)
  const isMoved = useRef(false)
  // 新增：每个结果项的ref
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useMessage(({ name }) => {
    if (!open && name === OPEN_POPUP) {
      handleOpen()
    }
    if (open && name === OPEN_POPUP) {
      setActiveIndex(prev => (prev + 1) % list.length)
    }
  })

  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery])

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
    await handleSearch()
    inputRef.current?.focus()
  }

  const handleClose = () => {
    setOpen(false)
    setSearchQuery('')
    setActiveIndex(0)
    setList([])
    isMoved.current = false
  }

  const handleSearch = async (keyword?: string) => {
    const { results } = await sendToBackground({
      name: 'search-all',
      body: { keyword },
    })
    setList(results)
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

  const debouncedSearch = useCallback(debouncePromise(handleSearch, 200), [])

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
