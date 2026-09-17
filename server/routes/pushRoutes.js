const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../authmiddleware");
const PushSubscription = require("../models/pushSubscription");

router.get("/vapid-public-key", (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

router.post("/subscribe", authMiddleware, async (req, res) => {
  const { endpoint, keys } = req.body;

  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    return res.status(400).json({ message: "endpoint, keys.p256dh, and keys.auth are required" });
  }

  try {
    const [subscription] = await PushSubscription.findOrCreate({
      where: { endpoint },
      defaults: {
        userId: req.user._id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error("Error saving push subscription:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
