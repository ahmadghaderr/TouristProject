const express = require("express");
const router = express.Router();
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

module.exports = router;