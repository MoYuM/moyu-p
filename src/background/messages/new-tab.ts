import type { PlasmoMessaging } from '@plasmohq/messaging'

export interface RequestBody {
  url: string
}

export interface ResponseBody {
  success: boolean
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  const { url } = req.body

  try {
    await chrome.tabs.create({ url })
    res.send({ success: true })
  }
  catch (error) {
    console.error('Error opening new tab:', error)
    res.send({ success: false })
  }
}

export default handler
