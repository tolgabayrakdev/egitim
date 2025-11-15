import SubscriptionService from "../service/subscription-service.js";

export default class SubscriptionController {
    constructor() {
        this.subscriptionService = new SubscriptionService();
    }

    async checkSubscription(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await this.subscriptionService.checkSubscriptionRequired(userId);

            res.status(200).json({
                success: true,
                ...result
            });
        } catch (error) {
            next(error);
        }
    }

    async getSubscription(req, res, next) {
        try {
            const userId = req.user.id;
            const subscription = await this.subscriptionService.getUserSubscription(userId);

            res.status(200).json({
                success: true,
                subscription: subscription
            });
        } catch (error) {
            next(error);
        }
    }

    async createSubscription(req, res, next) {
        try {
            const userId = req.user.id;
            const { planId, paymentMethod } = req.body;

            if (!planId) {
                return res.status(400).json({
                    success: false,
                    message: "Plan ID gereklidir"
                });
            }

            const subscription = await this.subscriptionService.createSubscription(
                userId,
                planId,
                paymentMethod || 'credit_card'
            );

            res.status(201).json({
                success: true,
                message: "Abonelik başarıyla oluşturuldu",
                subscription: subscription
            });
        } catch (error) {
            next(error);
        }
    }

    async getPlans(req, res, next) {
        try {
            const plans = await this.subscriptionService.getAllPlans();
            let hasUsedTrial = false;
            
            // Eğer kullanıcı giriş yapmışsa trial kullanım durumunu kontrol et
            if (req.user && req.user.id) {
                hasUsedTrial = await this.subscriptionService.hasUsedTrial(req.user.id);
            }
            
            res.status(200).json({
                success: true,
                plans: plans,
                hasUsedTrial: hasUsedTrial
            });
        } catch (error) {
            next(error);
        }
    }

    async createTrial(req, res, next) {
        try {
            const userId = req.user.id;
            const trial = await this.subscriptionService.createTrial(userId);

            res.status(201).json({
                success: true,
                message: "7 günlük ücretsiz deneme başlatıldı",
                subscription: trial
            });
        } catch (error) {
            next(error);
        }
    }
}

