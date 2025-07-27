import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'
import { DEFAULT_OPTIONS } from '../const'

export const userOptionStorage = new Storage()

export const STORAGE_KEY = 'userOptions'

export interface UserOptions {
  searchEngine: 'google' | 'bing' | 'baidu'
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
