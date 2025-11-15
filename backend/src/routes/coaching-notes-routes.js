import express from "express";
import { verifyToken } from "../middleware/verify-token.js";
import CoachingNotesController from "../controller/coaching-notes-controller.js";

const router = express.Router();
const notesController = new CoachingNotesController();

// Not oluşturma
router.post("/", verifyToken, notesController.createNote.bind(notesController));

// Katılımcıya ait notları getirme
router.get("/participant/:participant_id", verifyToken, notesController.getNotes.bind(notesController));

// Not detayı
router.get("/:noteId", verifyToken, notesController.getNoteById.bind(notesController));

// Not güncelleme
router.patch("/:noteId", verifyToken, notesController.updateNote.bind(notesController));

// Not silme
router.delete("/:noteId", verifyToken, notesController.deleteNote.bind(notesController));

export default router;

