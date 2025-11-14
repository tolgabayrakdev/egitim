import express from "express";
import { verifyToken } from "../middleware/verify-token.js";
import CoachingController from "../controller/coaching-controller.js";

const router = express.Router();
const coachingController = new CoachingController();

// Koçluk ilişkisi oluşturma (sadece profesyonel)
router.post("/", verifyToken, coachingController.createCoachingRelationship.bind(coachingController));

// Koçluk ilişkileri listesi (hem profesyonel hem participant)
router.get("/", verifyToken, coachingController.getCoachingRelationships.bind(coachingController));

// Koçluk ilişkisi detayı
router.get("/:relationshipId", verifyToken, coachingController.getCoachingRelationshipById.bind(coachingController));

// Koçluk ilişkisi durumu güncelleme
router.patch("/:relationshipId/status", verifyToken, coachingController.updateCoachingRelationshipStatus.bind(coachingController));

export default router;

