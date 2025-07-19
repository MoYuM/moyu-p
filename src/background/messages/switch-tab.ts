import type { PlasmoMessaging } from '@plasmohq/messaging'

export interface RequestBody {
  tabId: number
}

export interface ResponseBody {}

const handler: PlasmoMessaging.MessageHandler<
    RequestBody,
    ResponseBody
> = async (req, res) => {
  const { tabId } = req.body

  await chrome.tabs.update(tabId, { active: true })

  res.send({})
}

export default handler
