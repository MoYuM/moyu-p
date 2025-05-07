import type { PlasmoMessaging } from "@plasmohq/messaging"

export type RequestBody = {
    tabId: number
}

export type ResponseBody = {}

const handler: PlasmoMessaging.MessageHandler<
    RequestBody,
    ResponseBody
> = async (req, res) => {
    const { tabId } = req.body;

    await chrome.tabs.update(tabId, { active: true })

    res.send({})
}

export default handler