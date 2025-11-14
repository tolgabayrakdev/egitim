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
}

