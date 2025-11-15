import pool from "../config/database.js";
import HttpException from "../exceptions/http-exception.js";
import ActivityLogService from "./activity-log-service.js";

export default class CoachingService {
    constructor() {
        this.activityLogService = new ActivityLogService();
    }
    
    async createCoachingRelationship(professionalId, participantId, packageId) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Profesyonel kontrolü
            const professionalResult = await client.query(
                "SELECT id, role FROM users WHERE id = $1",
                [professionalId]
            );

            if (professionalResult.rows.length === 0 || professionalResult.rows[0].role !== 'professional') {
                throw new HttpException(403, "Sadece profesyonel kullanıcılar koçluk ilişkisi oluşturabilir");
            }

            // Participant kontrolü
            const participantResult = await client.query(
                "SELECT id, role FROM users WHERE id = $1",
                [participantId]
            );

            if (participantResult.rows.length === 0 || participantResult.rows[0].role !== 'participant') {
                throw new HttpException(404, "Katılımcı bulunamadı");
            }

            // Paket kontrolü
            const packageResult = await client.query(
                "SELECT * FROM packages WHERE id = $1 AND professional_id = $2",
                [packageId, professionalId]
            );

            if (packageResult.rows.length === 0) {
                throw new HttpException(404, "Paket bulunamadı veya size ait değil");
            }

            // Aynı ilişki var mı kontrol et
            const existingRelationship = await client.query(
                `SELECT id FROM coaching_relationships 
                 WHERE professional_id = $1 AND participant_id = $2 AND package_id = $3`,
                [professionalId, participantId, packageId]
            );

            if (existingRelationship.rows.length > 0) {
                throw new HttpException(409, "Bu koçluk ilişkisi zaten mevcut");
            }

            // Koçluk ilişkisi oluştur
            const result = await client.query(
                `INSERT INTO coaching_relationships (
                    professional_id, participant_id, package_id, status
                ) VALUES ($1, $2, $3, 'active')
                RETURNING *`,
                [professionalId, participantId, packageId]
            );

            await client.query("COMMIT");
            
            // Activity log oluştur
            await this.activityLogService.createActivityLog(
                professionalId,
                'coaching_relationship_created',
                'coaching_relationship',
                result.rows[0].id,
                participantId,
                `Koçluk ilişkisi oluşturuldu`
            );
            
            return result.rows[0];
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async getCoachingRelationships(userId, userRole) {
        let query;
        let params;

        if (userRole === 'professional') {
            query = `
                SELECT cr.*,
                       u1.first_name as participant_first_name,
                       u1.last_name as participant_last_name,
                       u1.email as participant_email,
                       p.title as package_title
                FROM coaching_relationships cr
                LEFT JOIN users u1 ON cr.participant_id = u1.id
                LEFT JOIN packages p ON cr.package_id = p.id
                WHERE cr.professional_id = $1
                ORDER BY cr.created_at DESC
            `;
            params = [userId];
        } else {
            query = `
                SELECT cr.*,
                       u1.first_name as professional_first_name,
                       u1.last_name as professional_last_name,
                       u1.email as professional_email,
                       p.title as package_title
                FROM coaching_relationships cr
                LEFT JOIN users u1 ON cr.professional_id = u1.id
                LEFT JOIN packages p ON cr.package_id = p.id
                WHERE cr.participant_id = $1
                ORDER BY cr.created_at DESC
            `;
            params = [userId];
        }

        const result = await pool.query(query, params);
        return result.rows;
    }

    async getCoachingRelationshipById(relationshipId, userId, userRole) {
        let query;
        let params;

        if (userRole === 'professional') {
            query = `
                SELECT cr.*,
                       u1.first_name as participant_first_name,
                       u1.last_name as participant_last_name,
                       u1.email as participant_email,
                       p.title as package_title,
                       p.description as package_description
                FROM coaching_relationships cr
                JOIN users u1 ON cr.participant_id = u1.id
                JOIN packages p ON cr.package_id = p.id
                WHERE cr.id = $1 AND cr.professional_id = $2
            `;
            params = [relationshipId, userId];
        } else {
            query = `
                SELECT cr.*,
                       u1.first_name as professional_first_name,
                       u1.last_name as professional_last_name,
                       u1.email as professional_email,
                       p.title as package_title,
                       p.description as package_description
                FROM coaching_relationships cr
                JOIN users u1 ON cr.professional_id = u1.id
                JOIN packages p ON cr.package_id = p.id
                WHERE cr.id = $1 AND cr.participant_id = $2
            `;
            params = [relationshipId, userId];
        }

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            throw new HttpException(404, "Koçluk ilişkisi bulunamadı");
        }

        return result.rows[0];
    }

    async updateCoachingRelationshipStatus(relationshipId, userId, userRole, status) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // İlişki kontrolü
            let query;
            let params;

            if (userRole === 'professional') {
                query = "SELECT * FROM coaching_relationships WHERE id = $1 AND professional_id = $2";
                params = [relationshipId, userId];
            } else {
                query = "SELECT * FROM coaching_relationships WHERE id = $1 AND participant_id = $2";
                params = [relationshipId, userId];
            }

            const existingRelationship = await client.query(query, params);

            if (existingRelationship.rows.length === 0) {
                throw new HttpException(404, "Koçluk ilişkisi bulunamadı");
            }

            // Status güncelleme
            const updateQuery = `
                UPDATE coaching_relationships 
                SET status = $1, 
                    ${status === 'completed' ? 'completed_at = NOW(),' : ''}
                    updated_at = NOW()
                WHERE id = $2
                RETURNING *
            `;

            const result = await client.query(
                updateQuery,
                [status, relationshipId]
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

    async getCoachingDetailedReport(userId, userRole, relationshipId) {
        // İlişki detayı
        const relationship = await this.getCoachingRelationshipById(relationshipId, userId, userRole);

        // İlişkiye ait tüm görevler
        const tasksQuery = `
            SELECT 
                t.*,
                COUNT(ts.id) as submission_count,
                MAX(ts.created_at) as last_submission_date
            FROM tasks t
            LEFT JOIN task_submissions ts ON ts.task_id = t.id
            WHERE t.coaching_relationship_id = $1
            GROUP BY t.id
            ORDER BY t.created_at DESC
        `;

        const tasksResult = await pool.query(tasksQuery, [relationshipId]);

        // Görev durum dağılımı
        const taskStatusQuery = `
            SELECT 
                status,
                COUNT(*) as count
            FROM tasks
            WHERE coaching_relationship_id = $1
            GROUP BY status
        `;

        const taskStatusResult = await pool.query(taskStatusQuery, [relationshipId]);

        // Ortalama görev tamamlanma süresi
        const avgCompletionQuery = `
            SELECT 
                AVG(EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / 86400) as avg_completion_days
            FROM tasks t
            WHERE t.coaching_relationship_id = $1 
            AND t.status = 'completed'
        `;

        const avgCompletionResult = await pool.query(avgCompletionQuery, [relationshipId]);

        return {
            relationship,
            tasks: tasksResult.rows,
            taskStatusDistribution: taskStatusResult.rows,
            avgCompletionDays: avgCompletionResult.rows[0]?.avg_completion_days || 0
        };
    }

    async getParticipantBySlug(professionalId, slug) {
        // Slug'ı parse et (tolga-bayrak -> first_name: tolga, last_name: bayrak)
        const nameParts = slug.split('-');
        if (nameParts.length < 2) {
            throw new HttpException(400, "Geçersiz slug formatı");
        }

        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join('-'); // Birden fazla kelime olabilir

        // Katılımcıyı bul ve koçluk ilişkisi kontrolü
        const result = await pool.query(
            `SELECT 
                u.*,
                COUNT(DISTINCT cr.id) as total_relationships,
                COUNT(DISTINCT cr.id) FILTER (WHERE cr.status = 'active') as active_relationships,
                COUNT(DISTINCT t.id) as total_tasks,
                COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks
             FROM users u
             LEFT JOIN coaching_relationships cr ON cr.participant_id = u.id AND cr.professional_id = $1
             LEFT JOIN tasks t ON t.coaching_relationship_id = cr.id
             WHERE LOWER(u.first_name) = LOWER($2) 
             AND LOWER(u.last_name) = LOWER($3)
             AND u.role = 'participant'
             GROUP BY u.id
             LIMIT 1`,
            [professionalId, firstName, lastName]
        );

        if (result.rows.length === 0) {
            throw new HttpException(404, "Katılımcı bulunamadı veya bu katılımcıyla koçluk ilişkiniz yok");
        }

        const participant = result.rows[0];

        // Koçluk ilişkilerini getir
        const relationshipsResult = await pool.query(
            `SELECT 
                cr.*,
                p.title as package_title,
                p.description as package_description
             FROM coaching_relationships cr
             LEFT JOIN packages p ON cr.package_id = p.id
             WHERE cr.participant_id = $1 AND cr.professional_id = $2
             ORDER BY cr.created_at DESC`,
            [participant.id, professionalId]
        );

        // Görev istatistiklerini getir
        const tasksStatsResult = await pool.query(
            `SELECT 
                t.status,
                COUNT(*) as count
             FROM tasks t
             INNER JOIN coaching_relationships cr ON t.coaching_relationship_id = cr.id
             WHERE cr.participant_id = $1 AND cr.professional_id = $2
             GROUP BY t.status`,
            [participant.id, professionalId]
        );

        return {
            participant,
            relationships: relationshipsResult.rows,
            taskStats: tasksStatsResult.rows
        };
    }

    async getParticipantAnalytics(professionalId, participantId, startDate = null, endDate = null) {
        let dateFilter = '';
        const params = [professionalId, participantId];

        if (startDate && endDate) {
            dateFilter = `AND cr.created_at >= $${params.length + 1} AND cr.created_at <= $${params.length + 2}`;
            params.push(startDate, endDate);
        }

        // Genel istatistikler
        const statsQuery = `
            SELECT 
                COUNT(DISTINCT cr.id) as total_relationships,
                COUNT(DISTINCT cr.id) FILTER (WHERE cr.status = 'active') as active_relationships,
                COUNT(DISTINCT cr.id) FILTER (WHERE cr.status = 'completed') as completed_relationships,
                COUNT(DISTINCT t.id) as total_tasks,
                COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
                COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'pending') as pending_tasks,
                COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'submitted') as submitted_tasks,
                CASE 
                    WHEN COUNT(DISTINCT t.id) > 0 
                    THEN ROUND(COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed')::numeric / COUNT(DISTINCT t.id)::numeric * 100, 2)
                    ELSE 0 
                END as completion_rate,
                AVG(CASE 
                    WHEN t.status = 'completed' AND t.updated_at IS NOT NULL
                    THEN EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / 86400 
                    ELSE NULL 
                END) as avg_task_completion_days
            FROM coaching_relationships cr
            LEFT JOIN tasks t ON t.coaching_relationship_id = cr.id
            WHERE cr.professional_id = $1 AND cr.participant_id = $2
            ${dateFilter}
        `;

        const statsResult = await pool.query(statsQuery, params);

        // Aylık görev tamamlanma trendi
        const trendQuery = `
            SELECT 
                DATE_TRUNC('month', t.updated_at) as month,
                COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
                COUNT(t.id) as total_tasks
            FROM coaching_relationships cr
            LEFT JOIN tasks t ON t.coaching_relationship_id = cr.id
            WHERE cr.professional_id = $1 AND cr.participant_id = $2
            AND t.updated_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', t.updated_at)
            ORDER BY month ASC
        `;

        const trendResult = await pool.query(trendQuery, [professionalId, participantId]);

        return {
            statistics: statsResult.rows[0],
            trends: trendResult.rows
        };
    }
}

