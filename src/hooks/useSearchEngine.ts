import type { UserOptions } from '~store/options'
import type { SearchResult } from '~type'
import baiduFavicon from 'data-base64:/assets/baidu.ico'
import bingFavicon from 'data-base64:/assets/bing.ico'
import googleFavicon from 'data-base64:/assets/google.ico'
import { useCallback } from 'react'
import { useUserOptions } from '~store/options'

/**
 * 搜索引擎相关配置
 * @returns 获取搜索引擎的搜索url和搜索项
 */
export function useSearchEngine() {
  const [userOptions] = useUserOptions()

  const searchEngine: UserOptions['searchEngine'] = userOptions?.searchEngine

  const getSearchUrl = (keyword: string) => {
    switch (searchEngine) {
      case 'google':
        return `https://www.google.com/search?q=${encodeURIComponent(keyword)}`
      case 'bing':
        return `https://www.bing.com/search?q=${encodeURIComponent(keyword)}`
      case 'baidu':
        return `https://www.baidu.com/s?wd=${encodeURIComponent(keyword)}`
      default:
        return `https://www.google.com/search?q=${encodeURIComponent(keyword)}`
    }
  }

  const getSearchFavicon = () => {
    switch (searchEngine) {
      case 'google':
        return googleFavicon
      case 'bing':
        return bingFavicon
      case 'baidu':
        return baiduFavicon
      default:
        return googleFavicon
    }
  }

  const upFirstLetter = (keyword: string) => {
    return keyword.charAt(0).toUpperCase() + keyword.slice(1)
  }

  const getSearchItem = (keyword: string): SearchResult => {
    return {
      id: 'search',
      title: `在 ${upFirstLetter(searchEngine)} 中搜索 "${keyword}"`,
      url: getSearchUrl(keyword),
      favicon: getSearchFavicon(),
      type: 'search',
      titlePinyin: '',
      titlePinyinInitials: '',
    }
  }

  return {
    getSearchUrl: useCallback(getSearchUrl, [searchEngine]),
    getSearchItem: useCallback(getSearchItem, [searchEngine]),
  }
}
