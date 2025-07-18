import { useState } from "react"
import DEFAULT_ICON from "data-base64:~assets/icon.png"
import { sendToBackground } from "@plasmohq/messaging"

const FaviconImg = ({ url }: { url?: string }) => {
    const [src, setSrc] = useState(() => {
        if (!url) return DEFAULT_ICON
        const cached = url ? localStorage.getItem('favicon_cache_' + url) : null
        return cached || url || DEFAULT_ICON
    })
    const [triedProxy, setTriedProxy] = useState(false)

    const handleError = async () => {
        if (!url || triedProxy) {
            setSrc(DEFAULT_ICON)
            return
        }
        setTriedProxy(true)
        // 先查缓存
        const cacheKey = 'favicon_cache_' + url
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
            setSrc(cached)
            return
        }
        try {
            const { dataUrl } = await sendToBackground({
                name: "fetch-favicon",
                body: { url }
            })
            if (dataUrl) {
                setSrc(dataUrl)
                localStorage.setItem(cacheKey, dataUrl)
            } else {
                setSrc(DEFAULT_ICON)
                localStorage.setItem(cacheKey, DEFAULT_ICON)
            }
        } catch {
            setSrc(DEFAULT_ICON)
            localStorage.setItem(cacheKey, DEFAULT_ICON)
        }
    }

    return (
        <img
            src={src}
            className="w-4 h-4 rounded"
            alt="tab"
            onError={e => { e.currentTarget.onerror = null; handleError() }}
        />
    )
}


export default FaviconImg;