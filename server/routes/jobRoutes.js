const express = require("express");
const router = express.Router();
const { runDailyDigest } = require("../jobs/dailyDigestJob");
const { checkAndSendReminders } = require("../jobs/preArrivalNotificationJob");

function requireCronSecret(req, res, next) {
  const secret = req.headers["x-cron-secret"];
  if (!secret || secret !== process.env.CRON_SECRET) {
    
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

router.post("/digest", requireCronSecret, (req, res) => {
  res.status(202).json({ message: "Digest job started" });
  runDailyDigest().catch((err) => console.error("Digest job failed:", err.message));
});

router.post("/reminders", requireCronSecret, (req, res) => {
  res.status(202).json({ message: "Reminder job started" });
  checkAndSendReminders().catch((err) => console.error("Reminder job failed:", err.message));
});

module.exports = router;
