import { useState, useCallback, useEffect, useRef } from "react"
import { useMessage } from "@plasmohq/messaging/hook"
import { sendToBackground } from "@plasmohq/messaging"
import { MESSAGE_ENUM } from "../const"
import { useKeyPress } from "ahooks"
import debouncePromise from "debounce-promise"
import cssText from "data-text:~style.css"
import clsx from "clsx"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const { OPEN_POPUP } = MESSAGE_ENUM

const Popup = () => {
  const [open, setOpen] = useState(false)
  const [list, setList] = useState<chrome.tabs.Tab[]>([])
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
      handleSwitchTab(list[activeIndex].id)
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
        handleSwitchTab(list[activeIndex].id);
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
    const { tabs } = await sendToBackground({
      name: "search-tabs",
      body: { keyword }
    })
    setList(tabs)
  }

  const handleSwitchTab = (tabId: number) => {
    sendToBackground({
      name: "switch-tab",
      body: { tabId }
    })
    handleClose();
  }

  const debouncedSearch = useCallback(debouncePromise(handleSearch, 200), [])

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
              onClick={() => handleSwitchTab(item.id)}
              onMouseOver={() => setActiveIndex(index)}
            >
              <img src={item.favIconUrl} className="w-4 h-4" />
              <div>{item.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Popup
