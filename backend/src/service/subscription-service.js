import pool from "../config/database.js";
import HttpException from "../exceptions/http-exception.js";

export default class SubscriptionService {
    
    async getUserSubscription(userId) {
        // Önce trial kontrolü yap
        const trialResult = await pool.query(
            `SELECT s.*, NULL as plan_name, NULL as plan_duration, NULL as plan_price
             FROM subscriptions s
             WHERE s.user_id = $1 AND s.status = 'active' AND s.is_trial = true
             ORDER BY s.created_at DESC
             LIMIT 1`,
            [userId]
        );

        if (trialResult.rows.length > 0) {
            const trial = trialResult.rows[0];
            const now = new Date();
            const trialEndDate = trial.trial_end_date ? new Date(trial.trial_end_date) : null;

            // Trial hala geçerliyse döndür
            if (trialEndDate && trialEndDate >= now) {
                return {
                    ...trial,
                    plan_name: 'trial',
                    plan_duration: 'trial'
                };
            }
        }

        // Trial yoksa veya bitmişse normal subscription kontrolü yap
        const result = await pool.query(
            `SELECT s.*, p.name as plan_name, p.duration as plan_duration, p.price as plan_price
             FROM subscriptions s
             LEFT JOIN plans p ON s.plan_id = p.id
             WHERE s.user_id = $1 AND s.status = 'active' AND (s.is_trial = false OR s.is_trial IS NULL)
             ORDER BY s.created_at DESC
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

    async getAllPlans() {
        const result = await pool.query(
            `SELECT * FROM plans ORDER BY name, duration`
        );
        return result.rows;
    }

    async checkSubscriptionRequired(userId) {
        // Kullanıcıyı kontrol et
        const userResult = await pool.query(
            "SELECT id FROM users WHERE id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            throw new HttpException(404, "Kullanıcı bulunamadı");
        }

        // Aktif subscription var mı kontrol et
        const subscription = await this.getUserSubscription(userId);

        return {
            required: false,
            hasSubscription: subscription !== null,
            subscription: subscription
        };
    }

    async createSubscription(userId, planId, paymentMethod) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Kullanıcıyı kontrol et
            const userResult = await client.query(
                "SELECT id FROM users WHERE id = $1",
                [userId]
            );

            if (userResult.rows.length === 0) {
                throw new HttpException(404, "Kullanıcı bulunamadı");
            }

            // Plan kontrolü
            const planResult = await client.query(
                "SELECT * FROM plans WHERE id = $1",
                [planId]
            );

            if (planResult.rows.length === 0) {
                throw new HttpException(400, "Geçersiz plan");
            }

            const plan = planResult.rows[0];

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
            
            if (plan.duration === 'monthly') {
                endDate.setMonth(endDate.getMonth() + 1);
            } else if (plan.duration === 'yearly') {
                endDate.setFullYear(endDate.getFullYear() + 1);
            }

            const result = await client.query(
                `INSERT INTO subscriptions (
                    user_id, plan_id, status, start_date, end_date, payment_method
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [userId, planId, 'active', startDate, endDate, paymentMethod]
            );

            await client.query("COMMIT");

            // Plan bilgilerini de ekleyerek döndür
            const subscription = result.rows[0];
            return {
                ...subscription,
                plan_name: plan.name,
                plan_duration: plan.duration,
                plan_price: plan.price
            };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async createTrial(userId) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Kullanıcıyı kontrol et
            const userResult = await client.query(
                "SELECT id FROM users WHERE id = $1",
                [userId]
            );

            if (userResult.rows.length === 0) {
                throw new HttpException(404, "Kullanıcı bulunamadı");
            }

            // Kullanıcının daha önce trial kullanıp kullanmadığını kontrol et
            const existingTrial = await client.query(
                `SELECT id FROM subscriptions 
                 WHERE user_id = $1 AND is_trial = true`,
                [userId]
            );

            if (existingTrial.rows.length > 0) {
                throw new HttpException(400, "Ücretsiz deneme süresi zaten kullanılmış");
            }

            // Mevcut aktif subscription'ı iptal et
            await client.query(
                `UPDATE subscriptions 
                 SET status = 'cancelled', updated_at = NOW()
                 WHERE user_id = $1 AND status = 'active'`,
                [userId]
            );

            // 7 günlük trial oluştur
            const startDate = new Date();
            const trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 gün sonra

            const result = await client.query(
                `INSERT INTO subscriptions (
                    user_id, plan_id, status, is_trial, trial_end_date, start_date, end_date, payment_method
                ) VALUES ($1, NULL, $2, true, $3, $4, $5, 'trial')
                RETURNING *`,
                [userId, 'active', trialEndDate, startDate, trialEndDate]
            );

            await client.query("COMMIT");

            return {
                ...result.rows[0],
                plan_name: 'trial',
                plan_duration: 'trial'
            };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async hasUsedTrial(userId) {
        const result = await pool.query(
            `SELECT id FROM subscriptions 
             WHERE user_id = $1 AND is_trial = true
             LIMIT 1`,
            [userId]
        );
        return result.rows.length > 0;
    }
}

