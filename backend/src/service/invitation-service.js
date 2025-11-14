import pool from "../config/database.js";
import { randomUUID } from "node:crypto";
import HttpException from "../exceptions/http-exception.js";
import { sendEmail } from "../util/send-email.js";

export default class InvitationService {
    
    async sendInvitation(invitedBy, email, packageId = null) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Davet eden kullanıcının profesyonel olduğunu kontrol et
            const inviterResult = await client.query(
                "SELECT id, role, first_name, last_name FROM users WHERE id = $1",
                [invitedBy]
            );

            if (inviterResult.rows.length === 0) {
                throw new HttpException(404, "Kullanıcı bulunamadı");
            }

            const inviter = inviterResult.rows[0];
            if (inviter.role !== 'professional') {
                throw new HttpException(403, "Sadece profesyonel kullanıcılar davet gönderebilir");
            }

            // E-posta adresinin zaten kayıtlı olup olmadığını kontrol et
            const existingUser = await client.query(
                "SELECT id FROM users WHERE email = $1",
                [email]
            );

            if (existingUser.rows.length > 0) {
                throw new HttpException(409, "Bu e-posta adresi zaten sistemde kayıtlı");
            }

            // Aynı e-posta için bekleyen bir davet var mı kontrol et
            const existingInvitation = await client.query(
                `SELECT id FROM invitations 
                 WHERE email = $1 AND status = 'pending' AND expires_at > NOW()`,
                [email]
            );

            if (existingInvitation.rows.length > 0) {
                throw new HttpException(409, "Bu e-posta adresine zaten aktif bir davet gönderilmiş");
            }

            // Paket kontrolü (eğer package_id verilmişse)
            if (packageId) {
                const packageResult = await client.query(
                    "SELECT id, title FROM packages WHERE id = $1 AND professional_id = $2",
                    [packageId, invitedBy]
                );

                if (packageResult.rows.length === 0) {
                    throw new HttpException(404, "Paket bulunamadı veya size ait değil");
                }
            }

            // Token oluştur
            const token = randomUUID();
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 gün

            // Davet kaydı oluştur
            const invitationResult = await client.query(
                `INSERT INTO invitations (invited_by, package_id, email, token, expires_at)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id, email, token, expires_at, created_at`,
                [invitedBy, packageId, email, token, expiresAt]
            );

            const invitation = invitationResult.rows[0];

            // Davet e-postası gönder
            const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invitation?token=${token}`;
            const inviterName = `${inviter.first_name} ${inviter.last_name}`;

            await sendEmail(
                email,
                "Edivora - Sistem Daveti",
                `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333;">Sisteme Davet Edildiniz</h2>
                    <p>Merhaba,</p>
                    <p><strong>${inviterName}</strong> sizi Edivora sistemine davet etti.</p>
                    <p>Daveti kabul etmek ve hesabınızı oluşturmak için aşağıdaki bağlantıya tıklayın:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${invitationLink}" 
                           style="background-color: #007bff; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Daveti Kabul Et
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                        Bu bağlantı 7 gün süreyle geçerlidir.
                    </p>
                    <p style="color: #666; font-size: 14px;">
                        Eğer bu daveti beklemiyorsanız, bu e-postayı görmezden gelebilirsiniz.
                    </p>
                </div>
                `
            );

            await client.query("COMMIT");

            return {
                id: invitation.id,
                email: invitation.email,
                expiresAt: invitation.expires_at,
                createdAt: invitation.created_at
            };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async getInvitationByToken(token) {
        const result = await pool.query(
            `SELECT i.*, u.first_name as inviter_first_name, u.last_name as inviter_last_name,
                    p.title as package_title
             FROM invitations i
             LEFT JOIN users u ON i.invited_by = u.id
             LEFT JOIN packages p ON i.package_id = p.id
             WHERE i.token = $1`,
            [token]
        );

        if (result.rows.length === 0) {
            throw new HttpException(404, "Davet bulunamadı");
        }

        const invitation = result.rows[0];

        // Süre kontrolü
        const now = new Date();
        const expiresAt = new Date(invitation.expires_at);

        if (now > expiresAt) {
            // Süresi dolmuş davetleri expired olarak işaretle
            await pool.query(
                "UPDATE invitations SET status = 'expired' WHERE token = $1",
                [token]
            );
            throw new HttpException(400, "Davet süresi dolmuş");
        }

        if (invitation.status !== 'pending') {
            throw new HttpException(400, `Bu davet ${invitation.status === 'accepted' ? 'zaten kabul edilmiş' : invitation.status === 'cancelled' ? 'iptal edilmiş' : 'süresi dolmuş'}`);
        }

        return {
            id: invitation.id,
            email: invitation.email,
            inviterName: `${invitation.inviter_first_name} ${invitation.inviter_last_name}`,
            packageTitle: invitation.package_title,
            packageId: invitation.package_id,
            expiresAt: invitation.expires_at
        };
    }

    async acceptInvitation(token, userData) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Daveti kontrol et
            const invitationResult = await client.query(
                `SELECT * FROM invitations WHERE token = $1`,
                [token]
            );

            if (invitationResult.rows.length === 0) {
                throw new HttpException(404, "Davet bulunamadı");
            }

            const invitation = invitationResult.rows[0];

            // Süre kontrolü
            const now = new Date();
            const expiresAt = new Date(invitation.expires_at);

            if (now > expiresAt) {
                await client.query(
                    "UPDATE invitations SET status = 'expired' WHERE token = $1",
                    [token]
                );
                throw new HttpException(400, "Davet süresi dolmuş");
            }

            if (invitation.status !== 'pending') {
                throw new HttpException(400, "Bu davet zaten kullanılmış");
            }

            // E-posta adresinin eşleştiğini kontrol et
            if (invitation.email.toLowerCase() !== userData.email.toLowerCase()) {
                throw new HttpException(400, "Davet e-posta adresi ile kayıt e-posta adresi eşleşmiyor");
            }

            // Kullanıcı kaydı oluştur (auth-service'deki register metodunu kullanabiliriz ama burada da yapabiliriz)
            // Davet ile kayıt olan kullanıcıların e-posta ve SMS doğrulamaları otomatik doğrulanmış olur
            const { hashPassword } = await import("../util/password.js");
            const hashedPassword = await hashPassword(userData.password);

            const newUserResult = await client.query(
                `INSERT INTO users (
                    email, password, first_name, last_name, phone, role, specialty,
                    is_email_verified, is_sms_verified, is_verified
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id, email, first_name, last_name, role`,
                [
                    userData.email,
                    hashedPassword,
                    userData.first_name,
                    userData.last_name,
                    userData.phone,
                    'participant', // Davet edilenler her zaman participant olur
                    null, // Specialty - davet ile gelen kullanıcılar için null
                    true, // is_email_verified - davet ile geldiği için otomatik doğrulanmış
                    true, // is_sms_verified - davet ile geldiği için otomatik doğrulanmış
                    true  // is_verified - backward compatibility için
                ]
            );

            const newUser = newUserResult.rows[0];

            // Daveti accepted olarak işaretle
            await client.query(
                `UPDATE invitations 
                 SET status = 'accepted', accepted_at = NOW() 
                 WHERE token = $1`,
                [token]
            );

            // Eğer package_id varsa, coaching_relationships tablosuna ekle
            if (invitation.package_id) {
                const packageResult = await client.query(
                    "SELECT professional_id FROM packages WHERE id = $1",
                    [invitation.package_id]
                );

                if (packageResult.rows.length > 0) {
                    await client.query(
                        `INSERT INTO coaching_relationships (professional_id, participant_id, package_id, status)
                         VALUES ($1, $2, $3, 'active')
                         ON CONFLICT (professional_id, participant_id, package_id) DO NOTHING`,
                        [packageResult.rows[0].professional_id, newUser.id, invitation.package_id]
                    );
                }
            }

            await client.query("COMMIT");

            return {
                user: newUser,
                invitationId: invitation.id
            };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async getInvitations(invitedBy, status = null) {
        let query = `
            SELECT i.*, 
                   u.first_name as inviter_first_name, 
                   u.last_name as inviter_last_name,
                   p.title as package_title
            FROM invitations i
            LEFT JOIN users u ON i.invited_by = u.id
            LEFT JOIN packages p ON i.package_id = p.id
            WHERE i.invited_by = $1
        `;
        const params = [invitedBy];

        if (status) {
            query += ` AND i.status = $2`;
            params.push(status);
        }

        query += ` ORDER BY i.created_at DESC`;

        const result = await pool.query(query, params);
        return result.rows.map(row => ({
            id: row.id,
            email: row.email,
            status: row.status,
            packageTitle: row.package_title,
            expiresAt: row.expires_at,
            acceptedAt: row.accepted_at,
            createdAt: row.created_at
        }));
    }

    async cancelInvitation(invitedBy, invitationId) {
        const result = await pool.query(
            `UPDATE invitations 
             SET status = 'cancelled' 
             WHERE id = $1 AND invited_by = $2 AND status = 'pending'
             RETURNING id`,
            [invitationId, invitedBy]
        );

        if (result.rows.length === 0) {
            throw new HttpException(404, "Davet bulunamadı veya iptal edilemez");
        }

        return { message: "Davet iptal edildi" };
    }
}
