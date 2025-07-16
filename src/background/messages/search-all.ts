import type { PlasmoMessaging } from "@plasmohq/messaging"
import Fuse from "fuse.js"
import pinyin from "pinyin"

export type RequestBody = {
  keyword: string
  maxResults?: number
}

export type SearchResult = {
  type: 'tab' | 'history' | 'bookmark'
  id: string
  title: string
  url: string
  lastAccessed?: number
  lastVisitTime?: number
  dateAdded?: number
  favicon?: string
}

export type ResponseBody = {
  results: SearchResult[]
}

// 按最近访问时间排序搜索结果
const sortResultsByTime = (results: SearchResult[]) => {
  return results.sort((a, b) => {
    const aTime = a.lastAccessed || a.lastVisitTime || a.dateAdded || 0
    const bTime = b.lastAccessed || b.lastVisitTime || b.dateAdded || 0
    return bTime - aTime
  })
}

// 为搜索项添加拼音支持
const addPinyinSupport = (items: any[], titleKey: string = 'title') => {
  return items.map(item => {
    const title = item[titleKey] || ""
    
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
      ...item,
      titlePinyin,
      titlePinyinInitials
    }
  })
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  const { keyword, maxResults = 50 } = req.body

  // 获取标签页
  const tabs = await chrome.tabs.query({ active: false })
  const tabResults: SearchResult[] = tabs.map(tab => ({
    type: 'tab',
    id: tab.id?.toString() || '',
    title: tab.title || '',
    url: tab.url || '',
    lastAccessed: (tab as any).lastAccessed,
    favicon: tab.favIconUrl
  }))

  // 获取历史记录 - 不使用 Chrome 自带的搜索，获取全量数据后用我们的中文优化搜索
  const history = await chrome.history.search({
    text: '', // 不传关键词，获取所有历史记录
    maxResults: 1000, // 获取更多历史记录用于搜索
    startTime: 0
  })
  const historyResults: SearchResult[] = history.map(item => ({
    type: 'history',
    id: item.id || '',
    title: item.title || '',
    url: item.url || '',
    lastVisitTime: item.lastVisitTime
  }))

  // 获取书签 - 不使用 Chrome 自带的搜索，获取全量数据后用我们的中文优化搜索
  const bookmarks = await chrome.bookmarks.search('') // 获取所有书签
  const bookmarkResults: SearchResult[] = bookmarks
    .filter(bookmark => bookmark.url) // 只保留有URL的书签
    .map(bookmark => ({
      type: 'bookmark',
      id: bookmark.id,
      title: bookmark.title || '',
      url: bookmark.url || '',
      dateAdded: bookmark.dateAdded
    }))

  // 如果关键词为空，只返回标签页
  if (!keyword) {
    const sortedResults = sortResultsByTime(tabResults)
    res.send({ results: sortedResults.slice(0, maxResults) })
    return
  }

  // 合并所有结果用于搜索
  let allResults = [...tabResults, ...historyResults, ...bookmarkResults]

  // 为所有结果添加拼音搜索支持
  const resultsWithPinyin = addPinyinSupport(allResults)

  const fuse = new Fuse(resultsWithPinyin, {
    includeScore: true,
    threshold: 0.3,
    keys: [
      "title", 
      "url", 
      "titlePinyin", 
      "titlePinyinInitials"
    ]
  })

  const searchResults = fuse.search(keyword)

  // 按时间排序搜索结果
  const sortedResults = sortResultsByTime(
    searchResults.map((item) => item.item)
  )

  res.send({
    results: sortedResults.slice(0, maxResults)
  })
}

export default handler 