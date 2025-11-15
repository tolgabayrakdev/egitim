import CoachingNotesService from "../service/coaching-notes-service.js";

export default class CoachingNotesController {
    constructor() {
        this.notesService = new CoachingNotesService();
    }

    async createNote(req, res, next) {
        try {
            const professionalId = req.user.id;
            const { participant_id, coaching_relationship_id, title, content, is_important } = req.body;

            if (!participant_id || !content) {
                return res.status(400).json({
                    success: false,
                    message: "Katılımcı ID ve içerik gereklidir"
                });
            }

            const result = await this.notesService.createNote(professionalId, participant_id, {
                coaching_relationship_id,
                title,
                content,
                is_important
            });

            res.status(201).json({
                success: true,
                message: "Not başarıyla oluşturuldu",
                note: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getNotes(req, res, next) {
        try {
            const professionalId = req.user.id;
            const { participant_id } = req.params;

            if (!participant_id) {
                return res.status(400).json({
                    success: false,
                    message: "Katılımcı ID gereklidir"
                });
            }

            const result = await this.notesService.getNotes(professionalId, participant_id);

            res.status(200).json({
                success: true,
                notes: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getNoteById(req, res, next) {
        try {
            const professionalId = req.user.id;
            const { noteId } = req.params;

            const result = await this.notesService.getNoteById(noteId, professionalId);

            res.status(200).json({
                success: true,
                note: result
            });
        } catch (error) {
            next(error);
        }
    }

    async updateNote(req, res, next) {
        try {
            const professionalId = req.user.id;
            const { noteId } = req.params;
            const { title, content, is_important } = req.body;

            const result = await this.notesService.updateNote(noteId, professionalId, {
                title,
                content,
                is_important
            });

            res.status(200).json({
                success: true,
                message: "Not başarıyla güncellendi",
                note: result
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteNote(req, res, next) {
        try {
            const professionalId = req.user.id;
            const { noteId } = req.params;

            await this.notesService.deleteNote(noteId, professionalId);

            res.status(200).json({
                success: true,
                message: "Not başarıyla silindi"
            });
        } catch (error) {
            next(error);
        }
    }
}

