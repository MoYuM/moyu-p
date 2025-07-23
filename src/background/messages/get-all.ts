import type { PlasmoMessaging } from '@plasmohq/messaging'
import Fuse from 'fuse.js'
import pinyin from 'pinyin'

export interface RequestBody {
  forceRefresh?: boolean
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
  titlePinyin?: string
  titlePinyinInitials?: string
}

export interface ResponseBody {
  results: SearchResult[]
  fuseIndex?: any // 预生成的 Fuse.js 索引
  fromCache: boolean
}

// 缓存相关
interface CacheData {
  results: SearchResult[]
  fuseIndex: any // Fuse.js 预生成的索引
  timestamp: number
  tabsHash: string
}

let cache: CacheData | null = null
const CACHE_DURATION = 30 * 1000 // 30秒缓存
const CACHE_DURATION_TABS_ONLY = 5 * 1000 // tabs变化频繁，5秒缓存

// 为搜索项添加拼音支持（优化版本）
function addPinyinSupport(items: SearchResult[]): SearchResult[] {
  return items.map((item) => {
    const title = item.title || ''
    if (!title)
      return item

    try {
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
    }
    catch {
      return item
    }
  })
}

// 获取所有书签（递归，优化版本）
async function getAllBookmarks(): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
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

// 生成tabs的简单hash用于检测变化
function generateTabsHash(tabs: chrome.tabs.Tab[]): string {
  return tabs
    .map(tab => `${tab.id}-${tab.title}-${tab.url}`)
    .join('|')
    .slice(0, 100) // 截断以提高性能
}

// 检查缓存是否有效
function isCacheValid(tabsHash: string, forceRefresh: boolean): boolean {
  if (forceRefresh || !cache)
    return false

  const now = Date.now()
  const isTimeValid = (now - cache.timestamp) < CACHE_DURATION
  const isTabsValid = cache.tabsHash === tabsHash

  // 如果tabs变化了，但时间还在短期缓存内，也认为有效（减少频繁刷新）
  const isShortTermValid = (now - cache.timestamp) < CACHE_DURATION_TABS_ONLY && isTabsValid

  return isTimeValid && (isTabsValid || isShortTermValid)
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  const { forceRefresh = false } = req.body

  try {
    // 获取当前窗口的所有tabs（用于hash检测）
    const allTabs = await chrome.tabs.query({ currentWindow: true })
    const tabsHash = generateTabsHash(allTabs)

    // 检查缓存
    if (isCacheValid(tabsHash, forceRefresh)) {
      res.send({
        results: cache!.results,
        fuseIndex: cache!.fuseIndex,
        fromCache: true,
      })
      return
    }

    // 并行获取所有数据
    const [currentTab, history, bookmarks] = await Promise.all([
      chrome.tabs.query({ active: true, currentWindow: true }),
      chrome.history.search({
        text: '',
        maxResults: 1000,
        startTime: 0,
      }),
      getAllBookmarks(),
    ])

    const currentTabId = currentTab[0]?.id

    // 处理tabs数据
    const tabResults: SearchResult[] = allTabs
      .filter(tab => tab.id !== currentTabId)
      .map(tab => ({
        type: 'tab',
        id: tab.id?.toString() || '',
        title: tab.title || '',
        url: tab.url || '',
        lastAccessed: (tab as any).lastAccessed || Date.now(),
        favicon: tab.favIconUrl,
      }))

    // 处理历史记录数据
    const historyResults: SearchResult[] = history.map(item => ({
      type: 'history',
      id: item.id || '',
      title: item.title || '',
      url: item.url || '',
      lastVisitTime: item.lastVisitTime,
    }))

    // 处理书签数据
    const bookmarkResults: SearchResult[] = bookmarks
      .filter(bookmark => bookmark.url)
      .map(bookmark => ({
        type: 'bookmark',
        id: bookmark.id,
        title: bookmark.title || '',
        url: bookmark.url || '',
        dateAdded: bookmark.dateAdded,
      }))

    // 合并所有结果
    const allResults = [...tabResults, ...historyResults, ...bookmarkResults]

    // 添加拼音支持
    const resultsWithPinyin = addPinyinSupport(allResults)

    // 预生成 Fuse.js 索引以加速搜索
    const fuseOptions = {
      includeScore: true,
      threshold: 0.3,
      keys: [
        'title',
        'url',
        'titlePinyin',
        'titlePinyinInitials',
      ],
    }
    const fuseIndex = Fuse.createIndex(fuseOptions.keys, resultsWithPinyin)

    // 更新缓存
    cache = {
      results: resultsWithPinyin,
      fuseIndex: fuseIndex.toJSON(), // 序列化索引以便传输
      timestamp: Date.now(),
      tabsHash,
    }

    res.send({
      results: resultsWithPinyin,
      fuseIndex: fuseIndex.toJSON(),
      fromCache: false,
    })
  }
  catch (error) {
    console.error('Error in get-all handler:', error)
    res.send({
      results: [],
      fromCache: false,
    })
  }
}

export default handler
