// whatsapp cloud api webhooks
const express = require("express");
// const whatsappService = require("../services/whatsapp.service");
const { ResMod } = require("../models/chat")

const router = express.Router();

router.get("/health", async (req, res) => {
    const data = await ResMod.find();
    if (!data) {
        return res.send(" no data found")
    }
    return res.status(200).json({ message: "ok", data: data });
});

// verification webhook
router.get("/webhooks", async (req, res) => {
    try {
        const challenge = req.query["hub.challenge"];

        // verify pre-set token
        // const token = process.env.WHATSAPP_WEBHOOK_TOKEN;
        const token = process.env.WTP_TOKEN;
        if (req.query["hub.verify_token"] === token) {
            console.log("verification from whatsapp successful");
            return res.status(200).send(challenge);
        }

        console.log("verification from whatsapp failed");
        return res.status(403).json({ message: "invalid_token" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "internal_server_error" });
    }
});

// events webhook
router.post("/webhooks", async (req, res) => {
    try {
        // log the req body
        console.log("webhook body:", JSON.stringify(req.body));
        const d = req.body;
        const dd = new ResMod({
            res: d
        })
        await dd.save()
        console.log(dd)


        // const ddd = req.body;

        // const dddd = await ddd.json()

        // const result = await whatsappService.handleWebhookEvents(req.body);

        return res.status(200).json({ message: "ok" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "internal_server_error" });
    }
});
const axios = require("axios");

router.post("/webhook", async (req, res) => {
    // Process the webhook normally
    console.log("Webhook received on server:", req.body);

    // Forward the request to your local machine
    try {
        await axios.post("http://192.168.29.224/24:3006/webhooks", req.body, {
            headers: req.headers,
        });
    } catch (error) {
        console.error("Error forwarding to localhost:", error.message);
    }

    // Respond to Meta
    res.status(200).send("EVENT_RECEIVED");
});



module.exports = router;
