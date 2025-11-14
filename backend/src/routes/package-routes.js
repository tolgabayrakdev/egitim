import express from "express";
import { verifyToken } from "../middleware/verify-token.js";
import PackageController from "../controller/package-controller.js";

const router = express.Router();
const packageController = new PackageController();

// Paket oluşturma (sadece profesyonel)
router.post("/", verifyToken, packageController.createPackage.bind(packageController));

// Paket listesi (sadece profesyonel)
router.get("/", verifyToken, packageController.getPackages.bind(packageController));

// Paket detayı (sadece profesyonel)
router.get("/:packageId", verifyToken, packageController.getPackageById.bind(packageController));

// Paket güncelleme (sadece profesyonel)
router.put("/:packageId", verifyToken, packageController.updatePackage.bind(packageController));

// Paket silme (sadece profesyonel)
router.delete("/:packageId", verifyToken, packageController.deletePackage.bind(packageController));

export default router;

