const express = require("express");
const router = express.Router();
const fs = require("fs");
const { google } = require("googleapis");
const { authMiddleware } = require("../authmiddleware");
const {
  createVisit, getAllVisits, editVisit, deleteVisit, markAsPaid, getPaymentSummary, getVisitById
} = require("../controller/visitController");
const { runDailyDigest } = require("../jobs/dailyDigestJob");

router.post("/create", authMiddleware, createVisit);
router.get("/visitor/:id", authMiddleware, getVisitById);
router.get("/all", authMiddleware, getAllVisits);
router.put("/mark-paid/:id", authMiddleware, markAsPaid);
router.get("/payment-summary", authMiddleware, getPaymentSummary);
router.put("/edit/:id", authMiddleware, editVisit);
router.delete("/delete/:id", authMiddleware, deleteVisit);

router.get("/digest/test", authMiddleware, async (req, res) => {
  await runDailyDigest();
  res.json({ message: "Digest job triggered — check your inbox" });
});

router.get("/calendar-diagnostic", async (req, res) => {
  if (req.headers["x-cron-secret"] !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const keyFilePath = process.env.GOOGLE_KEY_FILE;
  const result = { keyFilePath };

  try {
    result.fileExists = fs.existsSync(keyFilePath);
    const raw = fs.readFileSync(keyFilePath, "utf8");
    result.fileLength = raw.length;

    const parsed = JSON.parse(raw);
    result.parsedOk = true;
    result.hasType = !!parsed.type;
    result.hasClientEmail = !!parsed.client_email;
    result.clientEmail = parsed.client_email;
    result.privateKeyStartsCorrectly = parsed.private_key?.startsWith("-----BEGIN PRIVATE KEY-----");
    result.privateKeyHasRealNewlines = parsed.private_key?.includes("\n");
    result.privateKeyHasLiteralBackslashN = parsed.private_key?.includes("\\n");
  } catch (err) {
    result.readOrParseError = err.message;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    result.tokenObtained = !!token.token;
  } catch (err) {
    result.tokenError = err.message;
  }

  res.json(result);
});

module.exports = router;