import express from "express";
import { verifyToken } from "../middleware/verify-token.js";
import { verifySimpleCaptcha } from "../middleware/verify-simple-captcha.js";

import AuthController from "../controller/auth-controller.js";

const router = express.Router();
const authController = new AuthController();


router.post("/login", verifySimpleCaptcha, authController.login.bind(authController));
router.post("/register", authController.register.bind(authController));
router.post("/logout", verifyToken, authController.logout.bind(authController));

router.get("/verify-email", authController.verifyEmail.bind(authController));
router.post(
    "/resend-verification-email",
    authController.resendVerificationEmail.bind(authController)
);
router.post("/change-password", verifyToken, authController.changePassword.bind(authController));
router.put("/update-user", verifyToken, authController.updateUser.bind(authController));
router.post("/forgot-password", authController.forgotPassword.bind(authController));
router.get("/verify-reset-token", authController.verifyResetToken.bind(authController));
router.post("/reset-password", authController.resetPassword.bind(authController));
router.delete("/delete-account", verifyToken, authController.deleteAccount.bind(authController));
router.get("/me", authController.verifyUser.bind(authController));


export default router;
