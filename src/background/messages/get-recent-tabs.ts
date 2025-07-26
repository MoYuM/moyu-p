import type { PlasmoMessaging } from '@plasmohq/messaging'
import type { SearchResult } from '../../type'
import Fuse from 'fuse.js'
import { addPinyinSupport } from '../../utils/pinyin'

export type RequestBody = undefined

export interface ResponseBody {
  results: SearchResult[]
  fuseIndex?: any // 预生成的 Fuse.js 索引
  fromCache: boolean
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (_, res) => {
  try {
    const allTabs = await chrome.tabs.query({ currentWindow: true })

    // 处理tabs数据
    const tabResults = allTabs.map(tab => ({
      type: 'tab',
      id: tab.id?.toString() || '',
      title: tab.title || '',
      url: tab.url || '',
      favicon: tab.favIconUrl,
      lastAccessed: (tab as any).lastAccessed,
    }))
      .sort((a, b) => b.lastAccessed - a.lastAccessed)

    // 添加拼音支持
    const resultsWithPinyin = addPinyinSupport(tabResults as SearchResult[])

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
