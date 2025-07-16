import { useState, useCallback, useEffect, useRef } from "react"
import { useMessage } from "@plasmohq/messaging/hook"
import { sendToBackground } from "@plasmohq/messaging"
import { MESSAGE_ENUM } from "../const"
import { useKeyPress } from "ahooks"
import debouncePromise from "debounce-promise"
import cssText from "data-text:~style.css"
import clsx from "clsx"

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

  const inputRef = useRef<HTMLInputElement>(null)
  const isMoved = useRef(false)

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

  useKeyPress(["uparrow", "downarrow", "esc", "enter"], (_, key) => {
    if (key === "uparrow") {
      handlePrev();
    }
    if (key === "downarrow") {
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

  const debouncedSearch = useCallback(debouncePromise(handleSearch, 200), [])

  // 根据搜索结果类型获取图标
  const getResultIcon = (item: SearchResult) => {
    switch (item.type) {
      case 'tab':
        return item.favicon ? (
          <img src={item.favicon} className="w-4 h-4" alt="tab" />
        ) : (
          <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs">T</div>
        )
      case 'history':
        return (
          <div className="w-4 h-4 bg-gray-500 rounded-sm flex items-center justify-center text-white text-xs">H</div>
        )
      case 'bookmark':
        return (
          <div className="w-4 h-4 bg-yellow-500 rounded-sm flex items-center justify-center text-white text-xs">B</div>
        )
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
    }
  }

  return (
    <div
      className="fixed left-0 top-0 w-screen h-screen z-[9999]"
      style={{ display: open ? "block" : "none" }}
      onClick={handleClose}
    >
      <div
        className="absolute left-1/4 top-1/4 w-1/2 p-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex">
          <input
            ref={inputRef}
            className="w-full h-10 rounded-md border-gray-300 border px-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          {list?.map((item, index) => (
            <div
              key={item.id}
              className={clsx("flex items-center gap-2 p-2 rounded-md cursor-pointer", index === activeIndex && "bg-gray-100")}
              onClick={() => handleOpenResult(item)}
              onMouseOver={() => setActiveIndex(index)}
            >
              {getResultIcon(item)}
              <div className="flex-1 truncate">{item.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Popup
