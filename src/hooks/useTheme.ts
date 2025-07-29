import { useTheme as useAhooksTheme } from 'ahooks'
import { useUserOptions } from '~store/options'

/**
 * 获取当前主题
 * @returns 'dark' | 'light'
 */
export function useTheme() {
  const { theme } = useAhooksTheme()
  const [userOptions] = useUserOptions()

  const getTheme = () => {
    if (!userOptions?.appearance) {
      return theme
    }
    if (userOptions.appearance === 'system') {
      return theme
    }
    return userOptions.appearance
  }

  const currentTheme = getTheme()

  return [currentTheme]
}
