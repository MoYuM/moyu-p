import type { PlasmoMessaging } from "@plasmohq/messaging"
import Fuse, { type FuseResult } from "fuse.js"
import pinyin from "pinyin"

export type RequestBody = {
  keyword: string
}

export type ResponseBody = {
  tabs: chrome.tabs.Tab[]
}

// 按最近访问时间排序标签页
const sortTabsByLastAccessed = (tabs: chrome.tabs.Tab[]) => {
  return tabs.sort((a, b) => {
    const aTime = (a as any).lastAccessed || 0
    const bTime = (b as any).lastAccessed || 0
    return bTime - aTime
  })
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  const { keyword } = req.body;

  const tabs = await chrome.tabs.query({ active: false })

  // 如果 keyword 为空，则按最近使用顺序返回所有 tabs
  if (!keyword) {
    const sortedTabs = sortTabsByLastAccessed(tabs)
    res.send({ tabs: sortedTabs })
    return
  }

  // 为每个标签页添加拼音搜索支持
  const tabsWithPinyin = tabs.map(tab => {
    const title = tab.title || ""
    
    // 生成标题的拼音
    const titlePinyin = pinyin(title, {
      style: pinyin.STYLE_NORMAL,
      heteronym: false
    }).flat().join("")
    
    // 生成标题的拼音首字母
    const titlePinyinInitials = pinyin(title, {
      style: pinyin.STYLE_FIRST_LETTER,
      heteronym: false
    }).flat().join("")
    
    return {
      ...tab,
      titlePinyin: titlePinyin,
      titlePinyinInitials: titlePinyinInitials
    }
  })

  const fuse = new Fuse(tabsWithPinyin, {
    includeScore: true,
    threshold: 0.3,
    keys: [
      "title", 
      "url", 
      "titlePinyin", 
      "titlePinyinInitials"
    ]
  })

  const result = fuse.search(keyword)

  // 按最近访问时间排序搜索结果
  const sortedResults = sortTabsByLastAccessed(
    result.map((item) => item.item)
  )

  res.send({
    tabs: sortedResults
  })
}

export default handler