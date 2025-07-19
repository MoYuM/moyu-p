import type { PlasmoMessaging } from '@plasmohq/messaging'

export interface RequestBody {
  type: 'tab' | 'history' | 'bookmark'
  id: string
  url: string
}

export interface ResponseBody {
  success: boolean
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
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
