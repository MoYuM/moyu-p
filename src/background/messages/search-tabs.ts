import type { PlasmoMessaging } from "@plasmohq/messaging"
import Fuse, { type FuseResult } from "fuse.js"

export type RequestBody = {
  keyword: string
}

export type ResponseBody = {
  tabs: chrome.tabs.Tab[]
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  const { keyword } = req.body;

  const tabs = await chrome.tabs.query({})

  // 如果 keyword 为空，则返回所有 tabs
  if (!keyword) {
    res.send({ tabs })
    return
  }

  const fuse = new Fuse(tabs, {
    includeScore: true,
    threshold: 0.2,
    keys: ["title", "url"]
  })

  const result = fuse.search(keyword)

  res.send({
    tabs: result.map((item) => item.item)
  })
}

export default handler