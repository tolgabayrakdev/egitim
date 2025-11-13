import AuthService from "../service/auth-service.js";

export default class AuthController {
    constructor() {
        this.authService = new AuthService();
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            if (result.smsRequired) {
                return res.status(202).json({
                    message: "SMS doğrulaması gerekli",
                    email: result.email,
                    maskedPhone: result.maskedPhone,
                });
            }
            res.cookie("access_token", result.accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });
            res.cookie("refresh_token", result.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async register(req, res, next) {
        try {
            const { first_name, last_name, email, phone, password, role, specialty } = req.body;

            const result = await this.authService.register({
                first_name,
                last_name,
                email,
                phone,
                password,
                role: role || 'participant',
                specialty: specialty || null,
            });
            res.status(201).json({
                success: true,
                message: "Kullanıcı kaydı başarıyla gerçekleştirildi",
                user: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(_req, res, next) {
        try {
            res.clearCookie("access_token", { secure: true, sameSite: "none" });
            res.clearCookie("refresh_token", { secure: true, sameSite: "none" });
            res.status(200).json({
                success: true,
                message: "Çıkış işlemi başarıyla gerçekleştirildi"
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req, res, next) {
        try {
            const { token } = req.query;
            const result = await this.authService.verifyEmail(token);
            res.status(200).json({
                success: true,
                message: result
            })
        } catch (error) {
            next(error);
        }
    }

    async resendVerificationEmail(req, res, next) {
        try {
            const { email } = req.body;
            const result = await this.authService.resendVerificationEmail(email);
            res.status(200).json({
                success: true,
                message: result
            })
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req, res, next) {
        try {
            const id = req.user.id;
            const { currentPassword, newPassword } = req.body;
            const result = await this.authService.changePassword(id, currentPassword, newPassword);
            res.status(200).json({
                success: true,
                message: result
            })
        } catch (error) {
            next(error);
        }
    }

    async deleteAccount(req, res, next) {
        try {
            const id = req.user.id;
            const result = await this.authService.deleteAccount(id);
            res.status(200).json({
                success: true,
                message: result
            })
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await this.authService.forgotPassword(email);
            res.status(200).json({
                success: true,
                message: result
            })
        } catch (error) {
            next(error);
        }
    }

    async verifyResetToken(req, res, next) {
        try {
            const { token } = req.query;
            const result = await this.authService.verifyResetToken(token);
            res.status(200).json({
                success: true,
                message: result
            })
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token, newPassword } = req.body;
            const result = await this.authService.resetPassword(token, newPassword);
            res.status(200).json({
                success: true,
                message: result
            })
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req, res, next) {
        try {
            const id = req.user.id;
            const { first_name, last_name, email, phone } = req.body;
            const result = await this.authService.updateUser(id, { first_name, last_name, email, phone });
            res.status(200).json({
                success: true,
                message: "Kullanıcı bilgileri güncellendi",
                user: result
            })
        } catch (error) {
            next(error);
        }
    }

    async verifyUser(req, res, next) {
        try {
            const token = req.cookies.access_token;
            const user = await this.authService.verifyUser(token);
            res.status(200).json({
                success: true,
                message: "Kullanıcı doğrulandı",
                user: user
            });
        } catch (error) {
            next(error);
        }
    }
}