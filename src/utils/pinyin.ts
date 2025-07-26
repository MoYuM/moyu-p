import type { SearchResult } from '../type'
import pinyin from 'pinyin'

// 为搜索项添加拼音支持（优化版本）
export function addPinyinSupport(items: SearchResult[]): SearchResult[] {
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
