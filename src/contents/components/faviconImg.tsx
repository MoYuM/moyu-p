import { sendToBackground } from '@plasmohq/messaging'
import { useEffect, useState } from 'react'
import Circle from 'react:/assets/circle.svg'

function FaviconImg({ favicon, url }: { favicon?: string, url: string }) {
  const [src, setSrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasError, setHasError] = useState<boolean>(false)

  // 从URL中提取域名
  const getDomain = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname
    }
    catch {
      return url
    }
  }

  const domain = getDomain(url)
  const cacheKey = `favicon_cache_${domain}`

  // 将图片转换为base64
  const imageToBase64 = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = img.width
        canvas.height = img.height

        ctx?.drawImage(img, 0, 0)

        try {
          const dataURL = canvas.toDataURL('image/png')
          resolve(dataURL)
        }
        catch (error) {
          reject(error)
        }
      }

      img.onerror = reject
      img.src = imageUrl
    })
  }

  const loadFavicon = async () => {
    const cached = localStorage.getItem(cacheKey)

    if (cached) {
      setSrc(cached)
      setIsLoading(false)
      return
    }

    // 尝试直接加载图片并转换为base64
    try {
      const base64Data = await imageToBase64(favicon)
      setSrc(base64Data)
      localStorage.setItem(cacheKey, base64Data)
      setIsLoading(false)
    }
    catch {
      try {
        const { dataUrl } = await sendToBackground({
          name: 'fetch-favicon',
          body: { url: favicon },
        })

        if (dataUrl) {
          setSrc(dataUrl)
          localStorage.setItem(cacheKey, dataUrl)
        }
        else {
          setSrc('')
        }
      }
      catch {
        setSrc('')
      }

      setIsLoading(false)
      setHasError(true)
    }
  }

  const loadCache = async (retryCount = 0) => {
    const cached = localStorage.getItem(cacheKey)

    if (cached) {
      setSrc(cached)
      setIsLoading(false)
      return
    }

    // 如果没有缓存且重试次数少于3次，则重试
    if (retryCount < 3) {
      setTimeout(() => {
        loadCache(retryCount + 1)
      }, 500) // 1秒后重试
    }
    else {
      setIsLoading(false)
    }
  }

  // 组件挂载时加载favicon
  useEffect(() => {
    if (url) {
      if (favicon) {
        loadFavicon()
      }
      else {
        loadCache()
      }
    }
  }, [])

  // 显示加载中的占位符或默认图标
  if (isLoading || !src) {
    return (
      <div className="w-4 h-4 rounded flex items-center justify-center">
        <Circle className="w-3 h-3 text-gray-400" />
      </div>
    )
  }

  return (
    <img
      src={src}
      className="w-4 h-4 rounded"
      alt="tab"
      onError={(e) => {
        e.currentTarget.onerror = null
        if (!hasError) {
          loadFavicon()
        }
      }}
    />
  )
}

export default FaviconImg
