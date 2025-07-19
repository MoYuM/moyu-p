import { useState, useCallback, useEffect, useRef } from "react"
import { useMessage } from "@plasmohq/messaging/hook"
import { sendToBackground } from "@plasmohq/messaging"
import { MESSAGE_ENUM } from "../const"
import { useKeyPress } from "ahooks"
import debouncePromise from "debounce-promise"
import cssText from "data-text:~style.css"
import clsx from "clsx"

import FaviconImg from "./components/faviconImg"
import SearchInput from "./components/searchInput"


// 搜索结果类型
type SearchResult = {
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

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const { OPEN_POPUP } = MESSAGE_ENUM

const Popup = () => {
  const [open, setOpen] = useState(false)
  const [list, setList] = useState<SearchResult[]>([])
  const [searchQuery, setSearchQuery] = useState("")
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
        behavior: 'instant'
      })
    }
  }, [activeIndex])

  useKeyPress(["uparrow", "downarrow", "esc", "enter"], (_, key) => {
    if (key === "uparrow") {
      setIsKeyboardNav(true)
      handlePrev();
    }
    if (key === "downarrow") {
      setIsKeyboardNav(true)
      handleNext();
    }
    if (key === 'enter') {
      handleOpenResult(list[activeIndex])
    }
    if (key === 'esc') {
      handleClose();
    }
  })

  useKeyPress(["ctrl", "ctrl.p"], (e) => {
    if (e.type === 'keydown' && e.key === 'p' && e.ctrlKey && !open) {
      handleOpen();
    }
    if (e.type === 'keydown' && e.key === 'p' && e.ctrlKey && open) {
      isMoved.current = true;
      handleNext();
    }
    if (e.type === 'keyup' && e.key === 'Control' && open) {
      if (isMoved.current) {
        handleOpenResult(list[activeIndex]);
      }
    }
  }, {
    events: ['keydown', 'keyup']
  })

  const handlePrev = () => {
    setActiveIndex(prev => (prev - 1 + list.length) % list.length)
  }

  const handleNext = () => {
    setActiveIndex(prev => (prev + 1) % list.length)
  }

  const handleOpen = async () => {
    setOpen(true)
    await handleSearch();
    inputRef.current?.focus();
  }

  const handleClose = () => {
    setOpen(false)
    setSearchQuery("")
    setActiveIndex(0)
    setList([])
    isMoved.current = false;
  }

  const handleSearch = async (keyword?: string) => {
    const { results } = await sendToBackground({
      name: "search-all",
      body: { keyword }
    })
    setList(results)
  }

  const handleOpenResult = (item: SearchResult) => {
    sendToBackground({
      name: "open-result",
      body: {
        type: item.type,
        id: item.id,
        url: item.url
      }
    })
    handleClose();
  }

  const debouncedSearch = useCallback(debouncePromise(handleSearch, 100), [])

  // 根据搜索结果类型获取图标
  const getResultIcon = (item: SearchResult) => {
    // 其余类型也显示 icon
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
    <div
      className="fixed left-0 top-0 w-screen h-screen z-[9999]"
      style={{ display: open ? "block" : "none" }}
      onClick={handleClose}
    >
      <div
        className="absolute left-1/2 top-1/4 -translate-x-1/2 w-[700px] p-2 flex flex-col gap-2 bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜索框：无边框、无focus样式 */}
        <SearchInput
          ref={inputRef}
          value={searchQuery}
          onChange={setSearchQuery}
        />
        {/* 结果列表：高度固定、滚动、重阴影 */}
        <div className="flex flex-col gap-1 mt-2 overflow-y-auto rounded-xl bg-white max-h-96 min-h-12">
          {list?.map((item, index) => (
            <div
              key={item.id}
              ref={el => itemRefs.current[index] = el}
              className={clsx(
                "flex items-center justify-between gap-2 px-3 py-2 rounded-xl cursor-pointer",
                index === activeIndex ? "bg-gray-200" : "hover:bg-gray-100"
              )}
              onClick={() => handleOpenResult(item)}
              onMouseOver={() => {
                // 只有鼠标导航时才允许 setActiveIndex
                if (!isKeyboardNav) setActiveIndex(index)
              }}
              onMouseDown={() => setIsKeyboardNav(false)}
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
      </div>
    </div>
  )
}

export default Popup
