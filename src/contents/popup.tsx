import { useState } from "react"
import { useMessage } from "@plasmohq/messaging/hook"
import { MESSAGE_ENUM } from "../const"
import cssText from "data-text:~style.css"
 
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const { OPEN_POPUP } = MESSAGE_ENUM

const Popup = () => {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useMessage(({ name }) => {
    console.log("12312312", name)
    if (name === OPEN_POPUP) {
      setOpen(true)
    }
  })

  if (!open) return null;

  return (
    <div className="fixed top-20 w-screen h-screen   rounded-lg shadow-lg z-[9999]">
      <div className="flex left-1/4 w-1/2 justify-between items-center p-4 border-b bg-white">
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => {
            setOpen(false)
          }}>
          ✕
        </button>
      </div>
      <div className="p-4">123</div>
    </div>
  )
}

export default Popup
