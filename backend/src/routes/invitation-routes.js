import express from "express";
import { verifyToken } from "../middleware/verify-token.js";

import InvitationController from "../controller/invitation-controller.js";

const router = express.Router();
const invitationController = new InvitationController();


export default router;
