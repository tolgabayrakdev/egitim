import InvitationService from "../service/invitation-service.js";

export default class InvitationController {
    constructor() {
        this.invitationService = new InvitationService();
    }

    async sendInvitation(req, res, next) {
        try {
            const invitedBy = req.user.id;
            const { email, programId } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "E-posta adresi gereklidir"
                });
            }

            const result = await this.invitationService.sendInvitation(
                invitedBy,
                email,
                programId || null
            );

            res.status(201).json({
                success: true,
                message: "Davet başarıyla gönderildi",
                invitation: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getInvitationByToken(req, res, next) {
        try {
            const { token } = req.query;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: "Token gereklidir"
                });
            }

            const result = await this.invitationService.getInvitationByToken(token);

            res.status(200).json({
                success: true,
                invitation: result
            });
        } catch (error) {
            next(error);
        }
    }

    async acceptInvitation(req, res, next) {
        try {
            const { token, first_name, last_name, phone, password } = req.body;

            if (!token || !first_name || !last_name || !phone || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Tüm alanlar gereklidir"
                });
            }

            // Önce daveti kontrol et (e-posta adresini almak için)
            const invitation = await this.invitationService.getInvitationByToken(token);

            const result = await this.invitationService.acceptInvitation(token, {
                email: invitation.email,
                first_name,
                last_name,
                phone,
                password
            });

            res.status(200).json({
                success: true,
                message: "Davet kabul edildi ve hesap oluşturuldu. Lütfen giriş yapın.",
                user: result.user
            });
        } catch (error) {
            next(error);
        }
    }

    async getInvitations(req, res, next) {
        try {
            const invitedBy = req.user.id;
            const { status } = req.query;

            const result = await this.invitationService.getInvitations(
                invitedBy,
                status || null
            );

            res.status(200).json({
                success: true,
                invitations: result
            });
        } catch (error) {
            next(error);
        }
    }

    async cancelInvitation(req, res, next) {
        try {
            const invitedBy = req.user.id;
            const { invitationId } = req.params;

            const result = await this.invitationService.cancelInvitation(
                invitedBy,
                invitationId
            );

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }
}
