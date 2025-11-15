import pool from "../config/database.js";
import HttpException from "../exceptions/http-exception.js";

export default class CoachingNotesService {
    async createNote(professionalId, participantId, noteData) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Profesyonel kontrolü
            const professionalResult = await client.query(
                "SELECT id, role FROM users WHERE id = $1",
                [professionalId]
            );

            if (professionalResult.rows.length === 0 || professionalResult.rows[0].role !== 'professional') {
                throw new HttpException(403, "Sadece profesyonel kullanıcılar not oluşturabilir");
            }

            // Katılımcı kontrolü
            const participantResult = await client.query(
                "SELECT id, role FROM users WHERE id = $1",
                [participantId]
            );

            if (participantResult.rows.length === 0 || participantResult.rows[0].role !== 'participant') {
                throw new HttpException(404, "Katılımcı bulunamadı");
            }

            // Koçluk ilişkisi kontrolü (opsiyonel)
            let relationshipId = null;
            if (noteData.coaching_relationship_id) {
                const relationshipResult = await client.query(
                    `SELECT id FROM coaching_relationships 
                     WHERE id = $1 AND professional_id = $2 AND participant_id = $3`,
                    [noteData.coaching_relationship_id, professionalId, participantId]
                );
                if (relationshipResult.rows.length > 0) {
                    relationshipId = noteData.coaching_relationship_id;
                }
            }

            // Not oluştur
            const result = await client.query(
                `INSERT INTO coaching_notes (
                    professional_id, participant_id, coaching_relationship_id,
                    title, content, is_important
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [
                    professionalId,
                    participantId,
                    relationshipId,
                    noteData.title || null,
                    noteData.content,
                    noteData.is_important || false
                ]
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

    async getNotes(professionalId, participantId) {
        const result = await pool.query(
            `SELECT 
                cn.*,
                cr.id as relationship_id,
                p.title as package_title
             FROM coaching_notes cn
             LEFT JOIN coaching_relationships cr ON cn.coaching_relationship_id = cr.id
             LEFT JOIN packages p ON cr.package_id = p.id
             WHERE cn.professional_id = $1 AND cn.participant_id = $2
             ORDER BY cn.is_important DESC, cn.created_at DESC`,
            [professionalId, participantId]
        );
        return result.rows;
    }

    async getNoteById(noteId, professionalId) {
        const result = await pool.query(
            `SELECT cn.*
             FROM coaching_notes cn
             WHERE cn.id = $1 AND cn.professional_id = $2`,
            [noteId, professionalId]
        );

        if (result.rows.length === 0) {
            throw new HttpException(404, "Not bulunamadı");
        }

        return result.rows[0];
    }

    async updateNote(noteId, professionalId, updateData) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Not kontrolü
            const existingNote = await client.query(
                `SELECT * FROM coaching_notes 
                 WHERE id = $1 AND professional_id = $2`,
                [noteId, professionalId]
            );

            if (existingNote.rows.length === 0) {
                throw new HttpException(404, "Not bulunamadı");
            }

            // Not güncelle
            const result = await client.query(
                `UPDATE coaching_notes 
                 SET title = COALESCE($1, title),
                     content = COALESCE($2, content),
                     is_important = COALESCE($3, is_important),
                     updated_at = NOW()
                 WHERE id = $4 AND professional_id = $5
                 RETURNING *`,
                [
                    updateData.title,
                    updateData.content,
                    updateData.is_important,
                    noteId,
                    professionalId
                ]
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

    async deleteNote(noteId, professionalId) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Not kontrolü
            const existingNote = await client.query(
                `SELECT * FROM coaching_notes 
                 WHERE id = $1 AND professional_id = $2`,
                [noteId, professionalId]
            );

            if (existingNote.rows.length === 0) {
                throw new HttpException(404, "Not bulunamadı");
            }

            // Not sil
            await client.query(
                `DELETE FROM coaching_notes 
                 WHERE id = $1 AND professional_id = $2`,
                [noteId, professionalId]
            );

            await client.query("COMMIT");
            return true;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
}

