import express from "express";
import { verifyToken } from "../middleware/verify-token.js";
import ActivityLogController from "../controller/activity-log-controller.js";

const router = express.Router();
const activityLogController = new ActivityLogController();

// Activity log listesi
router.get("/", verifyToken, activityLogController.getActivityLogs.bind(activityLogController));

export default router;

