import type { PlasmoMessaging } from '@plasmohq/messaging'
import Fuse from 'fuse.js'
import pinyin from 'pinyin'

export interface RequestBody {
  keyword: string
  maxResults?: number
}

export interface SearchResult {
  type: 'tab' | 'history' | 'bookmark'
  id: string
  title: string
  url: string
  lastAccessed?: number
  lastVisitTime?: number
  dateAdded?: number
  favicon?: string
}

export interface ResponseBody {
  results: SearchResult[]
}

// 按最近访问时间排序搜索结果
function sortResultsByTime(results: SearchResult[]) {
  return results.sort((a, b) => {
    const aTime = a.lastAccessed || a.lastVisitTime || a.dateAdded || 0
    const bTime = b.lastAccessed || b.lastVisitTime || b.dateAdded || 0
    return bTime - aTime
  })
}

// 为搜索项添加拼音支持
function addPinyinSupport(items: any[], titleKey: string = 'title') {
  return items.map((item) => {
    const title = item[titleKey] || ''

    // 生成标题的拼音
    const titlePinyin = pinyin(title, {
      style: pinyin.STYLE_NORMAL,
      heteronym: false,
    }).flat().join('')

    // 生成标题的拼音首字母
    const titlePinyinInitials = pinyin(title, {
      style: pinyin.STYLE_FIRST_LETTER,
      heteronym: false,
    }).flat().join('')

    return {
      ...item,
      titlePinyin,
      titlePinyinInitials,
    }
  })
}

// 获取所有书签（递归）
async function getAllBookmarks() {
  const tree = await chrome.bookmarks.getTree()
  const bookmarks: chrome.bookmarks.BookmarkTreeNode[] = []
  const traverse = (nodes: chrome.bookmarks.BookmarkTreeNode[]) => {
    for (const node of nodes) {
      if (node.url) {
        bookmarks.push(node)
      }
      if (node.children) {
        traverse(node.children)
      }
    }
  }
  traverse(tree)
  return bookmarks
}

// 新增：fetch 并转 base64 dataUrl
async function fetchFaviconDataUrl(url: string): Promise<string | undefined> {
  if (!url)
    return undefined
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  }
  catch {
    return undefined
  }
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  const { keyword, maxResults = 50 } = req.body

  // 获取当前窗口的当前 tab
  const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const currentTabId = currentTab?.id

  // 获取当前窗口的所有 tab，排除当前 tab
  const allTabs = await chrome.tabs.query({ currentWindow: true })
  const tabResults: SearchResult[] = allTabs
    .filter(tab => tab.id !== currentTabId)
    .map(tab => ({
      type: 'tab',
      id: tab.id?.toString() || '',
      title: tab.title || '',
      url: tab.url || '',
      lastAccessed: (tab as any).lastAccessed,
      favicon: tab.favIconUrl,
    }))

  // 获取历史记录
  const history = await chrome.history.search({
    text: '',
    maxResults: maxResults > 50 ? 2000 : 1000, // 本地搜索时获取更多历史记录
    startTime: 0,
  })
  const historyResults: SearchResult[] = history.map(item => ({
    type: 'history',
    id: item.id || '',
    title: item.title || '',
    url: item.url || '',
    lastVisitTime: item.lastVisitTime,
  }))

  // 获取书签
  const bookmarks = await getAllBookmarks()
  const bookmarkResults: SearchResult[] = bookmarks
    .filter(bookmark => bookmark.url)
    .map(bookmark => ({
      type: 'bookmark',
      id: bookmark.id,
      title: bookmark.title || '',
      url: bookmark.url || '',
      dateAdded: bookmark.dateAdded,
    }))

  // ====== 无关键词逻辑 ======
  if (!keyword) {
    // 1. 只返回最近使用的 tab（不包括当前 tab），按最近访问时间排序，默认 6 个
    const sortedTabs = sortResultsByTime(tabResults)
    const results = sortedTabs.slice(0, 6)
    // 2. 不足 6 个时，用历史补足
    if (results.length < 6) {
      // 排除tab中已出现的url
      const tabUrls = new Set(results.map(r => r.url))
      const sortedHistory = sortResultsByTime(historyResults)
      for (const h of sortedHistory) {
        if (!tabUrls.has(h.url) && h.url) {
          results.push(h)
          tabUrls.add(h.url)
        }
        if (results.length >= 6)
          break
      }
    }
    // 3. 只返回6个
    res.send({ results: results.slice(0, 6) })
    return
  }

  // ====== 有关键词逻辑 ======
  // 合并所有结果用于搜索
  const allResults = [...tabResults, ...historyResults, ...bookmarkResults]
  // 拼音支持
  const resultsWithPinyin = addPinyinSupport(allResults)
  const fuse = new Fuse(resultsWithPinyin, {
    includeScore: true,
    threshold: 0.3,
    keys: [
      'title',
      'url',
      'titlePinyin',
      'titlePinyinInitials',
    ],
  })
  const searchResults = fuse.search(keyword)
  // 过滤重复（同title，优先tab>history>bookmark）
  const seenTitle = new Set<string>()
  const deduped: SearchResult[] = []
  for (const { item } of searchResults) {
    const title = item.title || item.url // 没有title用url
    if (!seenTitle.has(title)) {
      seenTitle.add(title)
      deduped.push(item)
    }
  }
  // 排序：tab/history按时间，书签永远排最后
  const tabAndHistory = deduped.filter(i => i.type !== 'bookmark')
  const bookmarksOnly = deduped.filter(i => i.type === 'bookmark')
  const sortedTabAndHistory = sortResultsByTime(tabAndHistory)
  const sortedResults = [...sortedTabAndHistory, ...bookmarksOnly]
  // 批量处理 faviconDataUrl
  const resultsWithFavicon = await Promise.all(
    sortedResults.slice(0, maxResults).map(async (item) => {
      if ((item.type === 'tab' || item.type === 'bookmark') && item.favicon) {
        const faviconDataUrl = await fetchFaviconDataUrl(item.favicon)
        return { ...item, faviconDataUrl }
      }
      return item
    }),
  )
  res.send({
    results: resultsWithFavicon,
  })
}

export default handler
