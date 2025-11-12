import AuthService from "../service/auth-service.js";

export default class AuthController {
    constructor() {
        this.authService = new AuthService();
    }

    async login(req, res, next) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async register(req, res, next) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async logout(_req, res, next) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req, res, next) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async resendVerificationEmail(req, res, next) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async changePassword(req, res, next) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async deleteAccount(req, res, next) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req, res, next) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async verifyResetToken(req, res, next) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async updateUser(req, res, next) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async verifyUser(req, res, next) {
        try {

        } catch (error) {
            next(error);
        }
    }
}