import express from "express";
import { verifyToken } from "../middleware/verify-token.js";
import SubscriptionController from "../controller/subscription-controller.js";

const router = express.Router();
const subscriptionController = new SubscriptionController();

// Subscription kontrolü (giriş gerekli)
router.get("/check", verifyToken, subscriptionController.checkSubscription.bind(subscriptionController));

// Mevcut subscription bilgisi (giriş gerekli)
router.get("/", verifyToken, subscriptionController.getSubscription.bind(subscriptionController));

// Subscription oluşturma (giriş gerekli)
router.post("/create", verifyToken, subscriptionController.createSubscription.bind(subscriptionController));

export default router;

