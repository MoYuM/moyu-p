export interface SearchResult {
  type: 'tab' | 'history' | 'bookmark'
  id: string
  title: string
  url: string
  lastAccessed?: number
  lastVisitTime?: number
  dateAdded?: number
  favicon?: string
  faviconDataUrl?: string
  titlePinyin?: string
  titlePinyinInitials?: string
}
