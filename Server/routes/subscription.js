import express from "express";
import verifyToken from "../middlewares/verify.js";
import {
  getSubscriptionPlans,
  getUserSubscription,
  subscribeToPlan,
  cancelSubscription,
  checkSubscriptionLimits,
  getAvailableModels,
  updateSelectedModel,
} from "../controllers/subscription.js";

const router = express.Router();

router.get("/plans", getSubscriptionPlans);
router.get("/user", verifyToken, getUserSubscription);
router.post("/subscribe", verifyToken, subscribeToPlan);
router.post("/cancel", verifyToken, cancelSubscription);
router.get("/limits", verifyToken, checkSubscriptionLimits);
router.get("/models", verifyToken, getAvailableModels);
router.post("/models/select", verifyToken, updateSelectedModel);

export default router;
