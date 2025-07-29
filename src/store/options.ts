import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'

export const userOptionStorage = new Storage()

export const STORAGE_KEY = 'userOptions'

/**
 * 默认配置
 */
export const DEFAULT_OPTIONS: UserOptions = {
  searchEngine: 'google',
  appearance: 'system',
}

export interface UserOptions {
  /** 搜索引擎 */
  searchEngine: 'google' | 'bing' | 'baidu'
  /** 外观 */
  appearance: 'light' | 'dark' | 'system'
}

export async function getUserOptions() {
  const userOptions = await userOptionStorage.get(STORAGE_KEY)
  return userOptions || DEFAULT_OPTIONS
}

export async function setUserOptions(userOptions: UserOptions) {
  await userOptionStorage.set(STORAGE_KEY, userOptions)
}

export function useUserOptions() {
  return useStorage<UserOptions>({
    key: STORAGE_KEY,
    instance: userOptionStorage,
  })
}
