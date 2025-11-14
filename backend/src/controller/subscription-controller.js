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
            const { plan, paymentMethod } = req.body;

            if (!plan) {
                return res.status(400).json({
                    success: false,
                    message: "Plan gereklidir"
                });
            }

            const subscription = await this.subscriptionService.createSubscription(
                userId,
                plan,
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
}

