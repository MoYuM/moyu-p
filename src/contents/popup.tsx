import { useState, useCallback, useEffect, useRef } from "react"
import { useMessage } from "@plasmohq/messaging/hook"
import { sendToBackground } from "@plasmohq/messaging"
import { MESSAGE_ENUM } from "../const"
import debouncePromise from "debounce-promise"
import cssText from "data-text:~style.css"
import clsx from "clsx"
import { useKeyPress } from "ahooks"

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

  useMessage(({ name }) => {
    if (name === OPEN_POPUP) {
      setOpen(true)
    }
  })

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open])

  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery])

  useKeyPress("uparrow", () => {
    setActiveIndex(prev => (prev - 1 + list.length) % list.length)
  })

  useKeyPress("downarrow", () => {
    setActiveIndex(prev => (prev + 1) % list.length)
  })

  useKeyPress("enter", () => {
    handleSwitchTab(list[activeIndex].id)
  })

  const handleClose = () => {
    setOpen(false)
  }

  const handleSearch = async (keyword: string) => {
    const res = await sendToBackground({
      name: "search-tabs",
      body: { keyword }
    })
    setList(res.tabs)
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
            className="w-full h-10 rounded-md border-gray-300 border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="p-4 flex flex-col gap-2">
          {list?.map((item, index) => (
            <div
              key={item.id}
              className={clsx("flex items-center gap-2", index === activeIndex && "bg-gray-100")}
              onClick={() => handleSwitchTab(item.id)}
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
