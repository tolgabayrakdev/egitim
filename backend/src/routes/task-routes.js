import express from "express";
import { verifyToken } from "../middleware/verify-token.js";
import TaskController from "../controller/task-controller.js";

const router = express.Router();
const taskController = new TaskController();

// Görev oluşturma (sadece profesyonel)
router.post("/", verifyToken, taskController.createTask.bind(taskController));

// Görev listesi (hem profesyonel hem participant)
router.get("/", verifyToken, taskController.getTasks.bind(taskController));

// Görev detayı
router.get("/:taskId", verifyToken, taskController.getTaskById.bind(taskController));

// Görev güncelleme
router.put("/:taskId", verifyToken, taskController.updateTask.bind(taskController));

// Görev silme (sadece profesyonel)
router.delete("/:taskId", verifyToken, taskController.deleteTask.bind(taskController));

// Görev gönderme (sadece participant)
router.post("/:taskId/submit", verifyToken, taskController.submitTask.bind(taskController));

// Görev gönderimleri listesi
router.get("/:taskId/submissions", verifyToken, taskController.getTaskSubmissions.bind(taskController));

// Görev gönderimini değerlendirme (sadece profesyonel)
router.post("/submissions/:submissionId/review", verifyToken, taskController.reviewTaskSubmission.bind(taskController));

export default router;

