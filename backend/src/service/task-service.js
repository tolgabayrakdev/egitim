import pool from "../config/database.js";
import HttpException from "../exceptions/http-exception.js";
import ActivityLogService from "./activity-log-service.js";

export default class TaskService {
    constructor() {
        this.activityLogService = new ActivityLogService();
    }
    
    async createTask(professionalId, taskData) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Koçluk ilişkisi kontrolü
            const relationshipResult = await client.query(
                `SELECT * FROM coaching_relationships 
                 WHERE id = $1 AND professional_id = $2 AND status = 'active'`,
                [taskData.coaching_relationship_id, professionalId]
            );

            if (relationshipResult.rows.length === 0) {
                throw new HttpException(404, "Koçluk ilişkisi bulunamadı veya aktif değil");
            }

            const relationship = relationshipResult.rows[0];

            // Task oluştur
            const result = await client.query(
                `INSERT INTO tasks (
                    coaching_relationship_id, assigned_by, assigned_to, 
                    title, description, due_date, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [
                    taskData.coaching_relationship_id,
                    professionalId,
                    relationship.participant_id,
                    taskData.title,
                    taskData.description || null,
                    taskData.due_date || null,
                    'pending'
                ]
            );

            await client.query("COMMIT");
            
            // Activity log oluştur
            await this.activityLogService.createActivityLog(
                professionalId,
                'task_created',
                'task',
                result.rows[0].id,
                relationship.participant_id,
                `Görev atandı: ${taskData.title}`
            );
            
            return result.rows[0];
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async getTasks(userId, userRole, coachingRelationshipId = null) {
        let query;
        let params;

        if (userRole === 'professional') {
            query = `
                SELECT t.*,
                       cr.participant_id,
                       u.first_name as participant_first_name,
                       u.last_name as participant_last_name,
                       (SELECT COUNT(*) FROM task_submissions ts WHERE ts.task_id = t.id) as submission_count
                FROM tasks t
                JOIN coaching_relationships cr ON t.coaching_relationship_id = cr.id
                JOIN users u ON cr.participant_id = u.id
                WHERE t.assigned_by = $1
            `;
            params = [userId];

            if (coachingRelationshipId) {
                query += ` AND t.coaching_relationship_id = $2`;
                params.push(coachingRelationshipId);
            }
        } else {
            query = `
                SELECT t.*,
                       cr.professional_id,
                       u.first_name as professional_first_name,
                       u.last_name as professional_last_name,
                       (SELECT COUNT(*) FROM task_submissions ts WHERE ts.task_id = t.id) as submission_count
                FROM tasks t
                JOIN coaching_relationships cr ON t.coaching_relationship_id = cr.id
                JOIN users u ON cr.professional_id = u.id
                WHERE t.assigned_to = $1
            `;
            params = [userId];

            if (coachingRelationshipId) {
                query += ` AND t.coaching_relationship_id = $2`;
                params.push(coachingRelationshipId);
            }
        }

        query += ` ORDER BY t.created_at DESC`;

        const result = await pool.query(query, params);
        
        // Overdue kontrolü ve güncelleme
        const now = new Date();
        const overdueTasks = [];
        
        for (const task of result.rows) {
            // Due date geçmiş ve status pending veya in_progress ise overdue yap
            if (task.due_date && 
                new Date(task.due_date) < now && 
                (task.status === 'pending' || task.status === 'in_progress')) {
                
                // Status'u overdue olarak güncelle
                await pool.query(
                    `UPDATE tasks 
                     SET status = 'overdue', updated_at = NOW() 
                     WHERE id = $1 AND status != 'overdue'`,
                    [task.id]
                );
                
                task.status = 'overdue';
                overdueTasks.push(task.id);
            }
        }
        
        // Eğer overdue görevler güncellendiyse, tekrar çek
        if (overdueTasks.length > 0) {
            const updatedResult = await pool.query(query, params);
            return updatedResult.rows;
        }
        
        return result.rows;
    }

    async getTaskById(taskId, userId, userRole) {
        let query;
        let params;

        if (userRole === 'professional') {
            query = `
                SELECT t.*,
                       cr.participant_id,
                       u.first_name as participant_first_name,
                       u.last_name as participant_last_name
                FROM tasks t
                JOIN coaching_relationships cr ON t.coaching_relationship_id = cr.id
                JOIN users u ON cr.participant_id = u.id
                WHERE t.id = $1 AND t.assigned_by = $2
            `;
            params = [taskId, userId];
        } else {
            query = `
                SELECT t.*,
                       cr.professional_id,
                       u.first_name as professional_first_name,
                       u.last_name as professional_last_name
                FROM tasks t
                JOIN coaching_relationships cr ON t.coaching_relationship_id = cr.id
                JOIN users u ON cr.professional_id = u.id
                WHERE t.id = $1 AND t.assigned_to = $2
            `;
            params = [taskId, userId];
        }

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            throw new HttpException(404, "Görev bulunamadı");
        }

        const task = result.rows[0];
        
        // Overdue kontrolü
        if (task.due_date && 
            new Date(task.due_date) < new Date() && 
            (task.status === 'pending' || task.status === 'in_progress')) {
            
            // Status'u overdue olarak güncelle
            await pool.query(
                `UPDATE tasks 
                 SET status = 'overdue', updated_at = NOW() 
                 WHERE id = $1 AND status != 'overdue'`,
                [task.id]
            );
            
            task.status = 'overdue';
        }

        return task;
    }

    async updateTask(taskId, userId, userRole, taskData) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Task kontrolü
            let query;
            let params;

            if (userRole === 'professional') {
                query = "SELECT * FROM tasks WHERE id = $1 AND assigned_by = $2";
                params = [taskId, userId];
            } else {
                query = "SELECT * FROM tasks WHERE id = $1 AND assigned_to = $2";
                params = [taskId, userId];
            }

            const existingTask = await client.query(query, params);

            if (existingTask.rows.length === 0) {
                throw new HttpException(404, "Görev bulunamadı");
            }

            const task = existingTask.rows[0];

            // Tamamlanmış veya iptal edilmiş görevlerin status'u değiştirilemez
            if (taskData.status !== undefined && (task.status === 'completed' || task.status === 'cancelled')) {
                throw new HttpException(400, "Tamamlanmış veya iptal edilmiş görevlerin durumu değiştirilemez");
            }

            // Güncelleme (sadece professional tüm alanları, participant sadece status'u güncelleyebilir)
            const updateFields = [];
            const values = [];
            let paramIndex = 1;

            if (userRole === 'professional') {
                if (taskData.title !== undefined) {
                    updateFields.push(`title = $${paramIndex++}`);
                    values.push(taskData.title);
                }
                if (taskData.description !== undefined) {
                    updateFields.push(`description = $${paramIndex++}`);
                    values.push(taskData.description);
                }
                if (taskData.due_date !== undefined) {
                    updateFields.push(`due_date = $${paramIndex++}`);
                    values.push(taskData.due_date);
                }
            }

            if (taskData.status !== undefined) {
                updateFields.push(`status = $${paramIndex++}`);
                values.push(taskData.status);
            }

            if (updateFields.length === 0) {
                throw new HttpException(400, "Güncellenecek alan belirtilmedi");
            }

            updateFields.push(`updated_at = NOW()`);
            values.push(taskId);

            const result = await client.query(
                `UPDATE tasks 
                 SET ${updateFields.join(', ')}
                 WHERE id = $${paramIndex++}
                 RETURNING *`,
                values
            );

            await client.query("COMMIT");
            return result.rows[0];
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async deleteTask(taskId, professionalId) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Task kontrolü (sadece professional silebilir)
            const existingTask = await client.query(
                "SELECT * FROM tasks WHERE id = $1 AND assigned_by = $2",
                [taskId, professionalId]
            );

            if (existingTask.rows.length === 0) {
                throw new HttpException(404, "Görev bulunamadı veya size ait değil");
            }

            await client.query("DELETE FROM tasks WHERE id = $1", [taskId]);
            await client.query("COMMIT");

            return { message: "Görev başarıyla silindi" };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async submitTask(taskId, participantId, submissionData) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Task kontrolü
            const taskResult = await client.query(
                `SELECT t.* FROM tasks t
                 JOIN coaching_relationships cr ON t.coaching_relationship_id = cr.id
                 WHERE t.id = $1 AND t.assigned_to = $2 AND cr.participant_id = $2`,
                [taskId, participantId]
            );

            if (taskResult.rows.length === 0) {
                throw new HttpException(404, "Görev bulunamadı veya size atanmamış");
            }

            const task = taskResult.rows[0];

            // Submission oluştur
            const submissionResult = await client.query(
                `INSERT INTO task_submissions (
                    task_id, submitted_by, submission_text, attachment_url, status
                ) VALUES ($1, $2, $3, $4, 'submitted')
                RETURNING *`,
                [
                    taskId,
                    participantId,
                    submissionData.submission_text || null,
                    submissionData.attachment_url || null
                ]
            );

            // Task status'unu güncelle
            await client.query(
                `UPDATE tasks SET status = 'submitted', updated_at = NOW() WHERE id = $1`,
                [taskId]
            );

            await client.query("COMMIT");
            
            // Activity log oluştur (transaction dışında)
            const relationshipResult = await pool.query(
                "SELECT professional_id FROM coaching_relationships WHERE id = $1",
                [task.coaching_relationship_id]
            );
            const professionalId = relationshipResult.rows[0]?.professional_id;
            
            await this.activityLogService.createActivityLog(
                participantId,
                'task_submitted',
                'task',
                taskId,
                professionalId,
                `Görev gönderildi: ${task.title}`
            );
            
            return submissionResult.rows[0];
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async getTaskSubmissions(taskId, userId, userRole) {
        let query;
        let params;

        if (userRole === 'professional') {
            query = `
                SELECT ts.*,
                       u.first_name as participant_first_name,
                       u.last_name as participant_last_name
                FROM task_submissions ts
                JOIN tasks t ON ts.task_id = t.id
                JOIN coaching_relationships cr ON t.coaching_relationship_id = cr.id
                JOIN users u ON ts.submitted_by = u.id
                WHERE ts.task_id = $1 AND cr.professional_id = $2
                ORDER BY ts.created_at DESC
            `;
            params = [taskId, userId];
        } else {
            query = `
                SELECT ts.*
                FROM task_submissions ts
                JOIN tasks t ON ts.task_id = t.id
                WHERE ts.task_id = $1 AND ts.submitted_by = $2
                ORDER BY ts.created_at DESC
            `;
            params = [taskId, userId];
        }

        const result = await pool.query(query, params);
        return result.rows;
    }

    async reviewTaskSubmission(submissionId, professionalId, reviewData) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Submission kontrolü
            const submissionResult = await client.query(
                `SELECT ts.*, t.assigned_by
                 FROM task_submissions ts
                 JOIN tasks t ON ts.task_id = t.id
                 WHERE ts.id = $1 AND t.assigned_by = $2`,
                [submissionId, professionalId]
            );

            if (submissionResult.rows.length === 0) {
                throw new HttpException(404, "Gönderim bulunamadı veya size ait değil");
            }

            // Review güncelleme
            const result = await client.query(
                `UPDATE task_submissions 
                 SET status = $1, 
                     feedback = $2,
                     reviewed_by = $3,
                     reviewed_at = NOW(),
                     updated_at = NOW()
                 WHERE id = $4
                 RETURNING *`,
                [
                    reviewData.status || 'reviewed',
                    reviewData.feedback || null,
                    professionalId,
                    submissionId
                ]
            );

            // Eğer approved ise task'ı completed yap
            if (reviewData.status === 'approved') {
                const submission = submissionResult.rows[0];
                await client.query(
                    `UPDATE tasks SET status = 'completed', updated_at = NOW() WHERE id = $1`,
                    [submission.task_id]
                );
            } else if (reviewData.status === 'needs_revision') {
                const submission = submissionResult.rows[0];
                await client.query(
                    `UPDATE tasks SET status = 'in_progress', updated_at = NOW() WHERE id = $1`,
                    [submission.task_id]
                );
            }

            await client.query("COMMIT");
            
            // Activity log oluştur (transaction dışında)
            const submission = submissionResult.rows[0];
            const taskResult = await pool.query(
                "SELECT assigned_to, title FROM tasks WHERE id = $1",
                [submission.task_id]
            );
            const participantId = taskResult.rows[0]?.assigned_to;
            
            await this.activityLogService.createActivityLog(
                professionalId,
                'task_reviewed',
                'task_submission',
                submissionId,
                participantId,
                `Görev değerlendirildi: ${taskResult.rows[0]?.title} - ${reviewData.status}`
            );
            
            return result.rows[0];
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
}

