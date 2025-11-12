import pool from "../config/database.js";
import crypto from "node:crypto";
import { randomUUID } from "node:crypto";
import HttpException from "../exceptions/http-exception.js";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../util/jwt.js";
import { comparePassword, hashPassword } from "../util/password.js";
import { sendEmail } from "../util/send-email.js";




export default class AuthService {

    async login(email, password) { }

    async register(user) { }

    async verifyEmail(token) { }

    async resendVerificationEmail(email) { }

    async changePassword(id, currentPassword, newPassword) { }

    async deleteAccount(id) { }

    async forgotPassword(email) { }

    async verifyResetToken(token) { }

    async resetPassword(token, newPassword) { }

    async updateUser(id, user) {
        try {

        } catch (error) {
            throw new HttpException(500, error.message);
        }
    }

    async verifyUser(token) {
        try {

        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(500, error.message || "Kullanıcı doğrulanırken hata oluştu");
        }
    }

}