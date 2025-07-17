import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const { url } = req.body
    try {
        const response = await fetch(url)
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onloadend = () => {
            res.send({ dataUrl: reader.result })
        }
        reader.readAsDataURL(blob)
    } catch (e) {
        res.send({ dataUrl: null })
    }
}

export default handler 