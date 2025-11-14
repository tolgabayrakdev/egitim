import pool from "../config/database.js";

export default class ActivityLogService {
    
    async createActivityLog(userId, actionType, entityType, entityId, targetUserId = null, description = null) {
        try {
            await pool.query(
                `INSERT INTO activity_logs (
                    user_id, target_user_id, entity_type, entity_id, action_type, description
                ) VALUES ($1, $2, $3, $4, $5, $6)`,
                [userId, targetUserId, entityType, entityId, actionType, description]
            );
        } catch (error) {
            // Activity log hataları kritik değil, sessizce geç
            console.error("Activity log oluşturulamadı:", error);
        }
    }

    async getActivityLogs(userId, limit = 50) {
        const result = await pool.query(
            `SELECT 
                al.*,
                u1.first_name as user_first_name,
                u1.last_name as user_last_name,
                u2.first_name as target_user_first_name,
                u2.last_name as target_user_last_name
             FROM activity_logs al
             LEFT JOIN users u1 ON al.user_id = u1.id
             LEFT JOIN users u2 ON al.target_user_id = u2.id
             WHERE al.user_id = $1 OR al.target_user_id = $1
             ORDER BY al.created_at DESC
             LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }
}

