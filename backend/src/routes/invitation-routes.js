import express from "express";
import { verifyToken } from "../middleware/verify-token.js";
import InvitationController from "../controller/invitation-controller.js";

const router = express.Router();
const invitationController = new InvitationController();

// Davet gönderme (sadece giriş yapmış profesyonel kullanıcılar)
router.post("/send", verifyToken, invitationController.sendInvitation.bind(invitationController));

// Davet listesi (sadece giriş yapmış kullanıcılar)
router.get("/", verifyToken, invitationController.getInvitations.bind(invitationController));

// Davet iptal etme (sadece giriş yapmış kullanıcılar)
router.delete("/:invitationId", verifyToken, invitationController.cancelInvitation.bind(invitationController));

// Davet bilgilerini token ile alma (herkese açık)
router.get("/token", invitationController.getInvitationByToken.bind(invitationController));

// Davet kabul etme (herkese açık)
router.post("/accept", invitationController.acceptInvitation.bind(invitationController));

export default router;
