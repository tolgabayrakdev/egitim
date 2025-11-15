import CoachingService from "../service/coaching-service.js";

export default class CoachingController {
    constructor() {
        this.coachingService = new CoachingService();
    }

    async createCoachingRelationship(req, res, next) {
        try {
            const professionalId = req.user.id;
            const { participant_id, package_id } = req.body;

            if (!participant_id || !package_id) {
                return res.status(400).json({
                    success: false,
                    message: "Katılımcı ID ve Paket ID gereklidir"
                });
            }

            const result = await this.coachingService.createCoachingRelationship(
                professionalId,
                participant_id,
                package_id
            );

            res.status(201).json({
                success: true,
                message: "Koçluk ilişkisi başarıyla oluşturuldu",
                relationship: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getCoachingRelationships(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            const result = await this.coachingService.getCoachingRelationships(userId, userRole);

            res.status(200).json({
                success: true,
                relationships: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getCoachingRelationshipById(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { relationshipId } = req.params;

            const result = await this.coachingService.getCoachingRelationshipById(
                relationshipId,
                userId,
                userRole
            );

            res.status(200).json({
                success: true,
                relationship: result
            });
        } catch (error) {
            next(error);
        }
    }

    async updateCoachingRelationshipStatus(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { relationshipId } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: "Status gereklidir"
                });
            }

            if (!['active', 'completed', 'cancelled'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Geçersiz status değeri"
                });
            }

            const result = await this.coachingService.updateCoachingRelationshipStatus(
                relationshipId,
                userId,
                userRole,
                status
            );

            res.status(200).json({
                success: true,
                message: "Koçluk ilişkisi durumu güncellendi",
                relationship: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getCoachingDetailedReport(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { relationshipId } = req.params;

            const result = await this.coachingService.getCoachingDetailedReport(
                userId,
                userRole,
                relationshipId
            );

            res.status(200).json({
                success: true,
                report: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getParticipantBySlug(req, res, next) {
        try {
            const professionalId = req.user.id;
            const { slug } = req.params;

            if (req.user.role !== 'professional') {
                return res.status(403).json({
                    success: false,
                    message: "Sadece profesyonel kullanıcılar bu bilgilere erişebilir"
                });
            }

            const result = await this.coachingService.getParticipantBySlug(professionalId, slug);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getParticipantAnalytics(req, res, next) {
        try {
            const professionalId = req.user.id;
            const { participantId } = req.params;
            const { start_date, end_date } = req.query;

            if (req.user.role !== 'professional') {
                return res.status(403).json({
                    success: false,
                    message: "Sadece profesyonel kullanıcılar bu bilgilere erişebilir"
                });
            }

            const result = await this.coachingService.getParticipantAnalytics(
                professionalId,
                participantId,
                start_date || null,
                end_date || null
            );

            res.status(200).json({
                success: true,
                analytics: result
            });
        } catch (error) {
            next(error);
        }
    }
}

