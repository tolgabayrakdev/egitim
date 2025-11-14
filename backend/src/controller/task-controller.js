import TaskService from "../service/task-service.js";

export default class TaskController {
    constructor() {
        this.taskService = new TaskService();
    }

    async createTask(req, res, next) {
        try {
            const professionalId = req.user.id;
            const { coaching_relationship_id, title, description, due_date } = req.body;

            if (!coaching_relationship_id || !title) {
                return res.status(400).json({
                    success: false,
                    message: "Koçluk ilişkisi ID ve görev başlığı gereklidir"
                });
            }

            const result = await this.taskService.createTask(professionalId, {
                coaching_relationship_id,
                title,
                description,
                due_date
            });

            res.status(201).json({
                success: true,
                message: "Görev başarıyla oluşturuldu",
                task: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getTasks(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { coaching_relationship_id } = req.query;

            const result = await this.taskService.getTasks(
                userId,
                userRole,
                coaching_relationship_id || null
            );

            res.status(200).json({
                success: true,
                tasks: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getTaskById(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { taskId } = req.params;

            const result = await this.taskService.getTaskById(taskId, userId, userRole);

            res.status(200).json({
                success: true,
                task: result
            });
        } catch (error) {
            next(error);
        }
    }

    async updateTask(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { taskId } = req.params;
            const { title, description, due_date, status } = req.body;

            const result = await this.taskService.updateTask(taskId, userId, userRole, {
                title,
                description,
                due_date,
                status
            });

            res.status(200).json({
                success: true,
                message: "Görev başarıyla güncellendi",
                task: result
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteTask(req, res, next) {
        try {
            const professionalId = req.user.id;
            const { taskId } = req.params;

            const result = await this.taskService.deleteTask(taskId, professionalId);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    async submitTask(req, res, next) {
        try {
            const participantId = req.user.id;
            const { taskId } = req.params;
            const { submission_text, attachment_url } = req.body;

            if (!submission_text && !attachment_url) {
                return res.status(400).json({
                    success: false,
                    message: "Gönderim metni veya dosya gereklidir"
                });
            }

            const result = await this.taskService.submitTask(taskId, participantId, {
                submission_text,
                attachment_url
            });

            res.status(201).json({
                success: true,
                message: "Görev başarıyla gönderildi",
                submission: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getTaskSubmissions(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { taskId } = req.params;

            const result = await this.taskService.getTaskSubmissions(taskId, userId, userRole);

            res.status(200).json({
                success: true,
                submissions: result
            });
        } catch (error) {
            next(error);
        }
    }

    async reviewTaskSubmission(req, res, next) {
        try {
            const professionalId = req.user.id;
            const { submissionId } = req.params;
            const { status, feedback } = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: "Status gereklidir"
                });
            }

            if (!['reviewed', 'approved', 'needs_revision'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Geçersiz status değeri"
                });
            }

            const result = await this.taskService.reviewTaskSubmission(
                submissionId,
                professionalId,
                { status, feedback }
            );

            res.status(200).json({
                success: true,
                message: "Gönderim değerlendirildi",
                submission: result
            });
        } catch (error) {
            next(error);
        }
    }
}

