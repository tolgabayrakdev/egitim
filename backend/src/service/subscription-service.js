import pool from "../config/database.js";
import HttpException from "../exceptions/http-exception.js";

export default class SubscriptionService {
    
    async getUserSubscription(userId) {
        const result = await pool.query(
            `SELECT * FROM subscriptions 
             WHERE user_id = $1 AND status = 'active'
             ORDER BY created_at DESC
             LIMIT 1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const subscription = result.rows[0];
        const now = new Date();
        const endDate = subscription.end_date ? new Date(subscription.end_date) : null;

        // Eğer end_date varsa ve geçmişse, subscription aktif değil
        if (endDate && endDate < now) {
            return null;
        }

        return subscription;
    }

    async checkSubscriptionRequired(userId) {
        // Kullanıcının rolünü kontrol et
        const userResult = await pool.query(
            "SELECT role FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            throw new HttpException(404, "Kullanıcı bulunamadı");
        }

        const user = userResult.rows[0];

        // Sadece profesyonel kullanıcılar için subscription gerekli
        if (user.role !== 'professional') {
            return { required: false };
        }

        // Aktif subscription var mı kontrol et
        const subscription = await this.getUserSubscription(userId);

        return {
            required: true,
            hasSubscription: subscription !== null,
            subscription: subscription
        };
    }

    async createSubscription(userId, plan, paymentMethod) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Kullanıcının profesyonel olduğunu kontrol et
            const userResult = await client.query(
                "SELECT role FROM users WHERE id = $1",
                [userId]
            );

            if (userResult.rows.length === 0) {
                throw new HttpException(404, "Kullanıcı bulunamadı");
            }

            if (userResult.rows[0].role !== 'professional') {
                throw new HttpException(403, "Sadece profesyonel kullanıcılar abonelik oluşturabilir");
            }

            // Plan kontrolü
            if (!['free', 'pro', 'premium'].includes(plan)) {
                throw new HttpException(400, "Geçersiz plan");
            }

            // Mevcut aktif subscription'ı iptal et
            await client.query(
                `UPDATE subscriptions 
                 SET status = 'cancelled', updated_at = NOW()
                 WHERE user_id = $1 AND status = 'active'`,
                [userId]
            );

            // Yeni subscription oluştur
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1); // 1 ay sonra

            const result = await client.query(
                `INSERT INTO subscriptions (
                    user_id, plan, status, start_date, end_date, payment_method
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [userId, plan, 'active', startDate, endDate, paymentMethod]
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

