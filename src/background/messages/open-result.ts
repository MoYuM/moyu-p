import type { PlasmoMessaging } from '@plasmohq/messaging'
import type { SearchResult } from '~type'

export interface ResponseBody {
  success: boolean
}

const handler: PlasmoMessaging.MessageHandler<
  SearchResult,
  ResponseBody
> = async (req, res) => {
  const { type, id, url } = req.body

  try {
    switch (type) {
      case 'tab':
        // 切换到指定标签页
        await chrome.tabs.update(Number.parseInt(id), { active: true })
        break

      case 'history':
      case 'bookmark':
      case 'search':
        // 在新标签页中打开历史记录或书签
        await chrome.tabs.create({ url })
        break

      default:
        throw new Error(`Unknown result type: ${type}`)
    }

    res.send({ success: true })
  }
  catch (error) {
    console.error('Error opening result:', error)
    res.send({ success: false })
  }
}

export default handler
