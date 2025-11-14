import pool from "../config/database.js";
import { randomUUID } from "node:crypto";
import HttpException from "../exceptions/http-exception.js";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../util/jwt.js";
import { comparePassword, hashPassword } from "../util/password.js";
import { sendEmail } from "../util/send-email.js";
import { sendSms } from "../util/send-sms.js";


export default class AuthService {

    async login(email, password) {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user) {
            throw new HttpException(404, "Kullanıcı bulunamadı!");
        }

        // Ban kontrolü
        if (user.is_banned === true) {
            throw new HttpException(403, "Hesabınız kapatılmıştır.");
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new HttpException(401, "Sifre yanlış!");
        }
        
        // Backward compatibility: prefer new column if exists; fall back to is_verified
        const isEmailVerified = user.is_email_verified ?? user.is_verified;
        
        // If email verification required and not yet verified, send OTP and return 202-style payload
        if (!isEmailVerified) {
            const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
            const createdAt = new Date();

            await pool.query(
                `UPDATE users SET email_verify_code = $1, email_verify_code_created_at = $2 WHERE id = $3`,
                [code, createdAt, user.id]
            );

            // Send email OTP
            await sendEmail(
                user.email,
                "Edivora E-posta Doğrulama Kodu",
                `<p>Merhaba ${user.first_name},</p>
                <p>E-posta doğrulama kodunuz: <strong style="font-size: 16px; letter-spacing: 4px;">${code}</strong></p>
                <p>Bu kod 3 dakika geçerlidir.</p>`
            );

            return { emailRequired: true, email: user.email };
        }

        // If SMS verification required and not yet verified, send OTP and return 202-style payload
        if (user.is_sms_verified === false) {
            const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
            const createdAt = new Date();

            await pool.query(
                `UPDATE users SET sms_verify_code = $1, sms_verify_code_created_at = $2 WHERE id = $3`,
                [code, createdAt, user.id]
            );

            // Send SMS (best-effort; if SMS fails, surface error)
            const phoneNumber = user.phone;
            if (!phoneNumber) {
                throw new HttpException(400, "SMS doğrulaması için kayıtlı bir telefon numarası bulunamadı.");
            }
            await sendSms({ msg: `RandevuHazır doğrulama kodunuz: ${code}. Kod 3 dakika geçerlidir.`, no: phoneNumber });

            const maskedPhone = phoneNumber.replace(/(\+?\d{0,3})?(\d{2})(\d+)(\d{2})$/, (_m, cc = "", p2, mid, p4) => {
                return `${cc || ""}${p2}${"*".repeat(mid.length)}${p4}`;
            });

            return { smsRequired: true, email: user.email, maskedPhone };
        }

        const accessToken = generateAccessToken({ id: user.id, role: "user" });
        const refreshToken = generateRefreshToken({ id: user.id, role: "user" });
        return { accessToken, refreshToken };
    }

    async register(user) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Sadece profesyoneller kayıt olabilir
            if (user.role !== 'professional') {
                throw new HttpException(400, "Sadece profesyoneller kayıt olabilir. Katılımcılar davet linki ile sisteme girebilir.");
            }

            // Specialty zorunlu
            if (!user.specialty || !user.specialty.trim()) {
                throw new HttpException(400, "Uzmanlık alanı zorunludur");
            }

            const existingUser = await client.query("SELECT * FROM users WHERE email = $1", [
                user.email,
            ]);

            if (existingUser.rows.length > 0) {
                throw new HttpException(409, "Bu e-posta adresi zaten kullanılıyor.");
            }

            const existingPhone = await client.query("SELECT * FROM users WHERE phone = $1", [
                user.phone,
            ]);

            if (existingPhone.rows.length > 0) {
                throw new HttpException(409, "Bu telefon numarası zaten kayıtlı.");
            }

            const hashedPassword = await hashPassword(user.password);

            const newUser = await client.query(
                `
                INSERT INTO users(
                    email,
                    password,
                    first_name,
                    last_name,
                    phone,
                    role,
                    specialty
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
                `,
                [
                    user.email,
                    hashedPassword,
                    user.first_name,
                    user.last_name,
                    user.phone,
                    user.role,
                    user.specialty
                ]
            );
            await client.query("COMMIT");

            return newUser.rows[0].id;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async verifyEmail(token) {

        const result = await pool.query(
            `
            SELECT email_verify_token_created_at FROM users WHERE email_verify_token = $1
            `,
            [token]
        );

        if (result.rows.length === 0) {
            throw new HttpException(400, "Token geçersiz veya süresi dolmuş");
        }

        const tokenCreatedAt = result.rows[0].email_verify_token_created_at;
        const now = new Date();
        const diffMs = now - tokenCreatedAt;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours > 1) {
            throw new HttpException(400, "Token süresi doldu. Lütfen tekrar kayıt olun");
        }

        await pool.query(
            `
            UPDATE users 
            SET is_email_verified = true, is_verified = true, email_verify_token = NULL, email_verify_token_created_at = NULL
            WHERE email_verify_token = $1
            `,
            [token]
        );

        return { message: "E-posta başarıyla doğrulandı" };


    }

    async resendVerificationEmail(email) {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user) {
            throw new HttpException(404, "Kullanıcı bulunamadı!");
        }

        // Backward compatibility: check both columns
        const isEmailVerified = user.is_email_verified ?? user.is_verified;
        if (isEmailVerified) {
            throw new HttpException(400, "E-posta zaten doğrulanmış");
        }

        const now = new Date();

        if (user.email_verify_code_created_at) {
            const diffMs = now - new Date(user.email_verify_code_created_at);
            const diffMinutes = diffMs / (1000 * 60);

            // ✅ Son gönderim üzerinden 2 dakika geçmedi ise
            if (diffMinutes < 2) {
                throw new HttpException(
                    429,
                    "Yeni bir doğrulama kodu istemeden önce lütfen birkaç dakika bekleyin."
                );
            }
        }

        const newCode = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
        const newCreatedAt = new Date();

        await pool.query(
            `
            UPDATE users 
            SET email_verify_code = $1, email_verify_code_created_at = $2
            WHERE email = $3
        `,
            [newCode, newCreatedAt, email]
        );

        await sendEmail(
            user.email,
            "Edivora E-posta Doğrulama Kodu",
            `<p>Merhaba ${user.first_name},</p>
            <p>E-posta doğrulama kodunuz: <strong style="font-size: 24px; letter-spacing: 4px;">${newCode}</strong></p>
            <p>Bu kod 3 dakika geçerlidir.</p>`
        );

        return { message: "Yeni bir doğrulama kodu gönderildi." };
    }

    async changePassword(id, currentPassword, newPassword) {
        const user = await pool.query("SELECT password FROM users WHERE id = $1", [id]);
        const isPasswordMatch = await comparePassword(currentPassword, user.rows[0].password);
        if (!isPasswordMatch) {
            throw new HttpException(400, "Mevcut şifre yanlış");
        }
        const hashedPassword = await hashPassword(newPassword);
        await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, id]);
        return { message: "Parola başarıyla değiştirildi" };
    }

    async deleteAccount(id) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            await client.query("DELETE FROM users WHERE id = $1", [id]);

            await client.query("COMMIT");

            return { message: "Hesabınız ve ilişkili tüm veriler başarıyla silindi." };
        } catch (error) {
            await client.query("ROLLBACK");
            throw new HttpException(500, "Hesap silme işlemi sırasında bir hata oluştu.");
        } finally {
            client.release();
        }
    }

    async forgotPassword(email) {
        const client = await pool.connect();
        try {
            const userResult = await client.query("SELECT id FROM users WHERE email = $1", [email]);

            // Bilinmeyen kullanıcıya sabit cevap döndür
            if (userResult.rowCount === 0) {
                return {
                    message: "Parola sıfırlama e-postası gönderildi (varsa e-posta adresiniz)",
                };
            }

            const userId = userResult.rows[0].id;

            const token = randomUUID();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

            await client.query(
                "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
                [userId, token, expiresAt]
            );
            const resetLink = `https://${process.env.HOST}/reset-password?token=${token}`;

            await sendEmail(
                email,
                "Edivora Parola Sıfırlama",
                `<p>Merhaba,</p>
                <p>Parolanızı sıfırlamak için <a href="${resetLink}">buraya tıklayın</a>.</p>`
            );

            return { message: "Parola sıfırlama e-postası gönderildi." };
        } finally {
            client.release();
        }
    }

    async verifyResetToken(token) {
        const result = await pool.query(
            "SELECT * FROM password_reset_tokens WHERE token = $1",
            [token]
        );

        if (result.rowCount === 0) {
            throw new HttpException(400, "Geçersiz veya süresi dolmuş token");
        }

        const resetToken = result.rows[0];
        const now = new Date();
        const expiresAt = new Date(resetToken.expires_at);

        if (now > expiresAt) {
            throw new HttpException(400, "Token süresi dolmuş");
        }

        return { valid: true, message: "Token geçerli" };
    }

    async resetPassword(token, newPassword) {
        const client = await pool.connect();
        try {
            const tokenResult = await client.query(
                "SELECT * FROM password_reset_tokens WHERE token = $1",
                [token]
            );

            if (tokenResult.rowCount === 0) {
                throw new HttpException(400, "Geçersiz veya süresi dolmuş token");
            }

            const resetToken = tokenResult.rows[0];
            const now = new Date();
            const expiresAt = new Date(resetToken.expires_at);

            if (now > expiresAt) {
                throw new HttpException(400, "Token süresi dolmuş");
            }

            const hashedPassword = await hashPassword(newPassword);

            await client.query("UPDATE users SET password = $1 WHERE id = $2", [
                hashedPassword,
                resetToken.user_id,
            ]);

            await client.query("DELETE FROM password_reset_tokens WHERE token = $1", [token]);

            return { message: "Parola sıfırlama başarılı" };
        } finally {
            client.release();
        }
    }

    async updateUser(id, user) {
        try {
            const client = await pool.connect();
            try {
                await client.query("BEGIN");

                // Mevcut kullanıcıyı kontrol et
                const existingUser = await client.query("SELECT * FROM users WHERE id = $1", [id]);
                if (existingUser.rows.length === 0) {
                    throw new HttpException(404, "Kullanıcı bulunamadı");
                }

                // Email ve telefon güncellenemez - sabit kalmalı
                if (user.email !== undefined || user.phone !== undefined) {
                    throw new HttpException(400, "E-posta ve telefon numarası değiştirilemez");
                }

                // Güncellenecek alanları belirle (sadece first_name, last_name, bio, specialty)
                const updateFields = [];
                const updateValues = [];
                let paramIndex = 1;

                if (user.first_name !== undefined) {
                    updateFields.push(`first_name = $${paramIndex++}`);
                    updateValues.push(user.first_name);
                }
                if (user.last_name !== undefined) {
                    updateFields.push(`last_name = $${paramIndex++}`);
                    updateValues.push(user.last_name);
                }
                if (user.bio !== undefined) {
                    updateFields.push(`bio = $${paramIndex++}`);
                    updateValues.push(user.bio);
                }
                if (user.specialty !== undefined) {
                    updateFields.push(`specialty = $${paramIndex++}`);
                    updateValues.push(user.specialty);
                }

                if (updateFields.length === 0) {
                    throw new HttpException(400, "Güncellenecek alan bulunamadı");
                }

                // updated_at ekle
                updateFields.push(`updated_at = $${paramIndex++}`);
                updateValues.push(new Date());

                // ID'yi ekle
                updateValues.push(id);

                const query = `
                    UPDATE users 
                    SET ${updateFields.join(", ")}
                    WHERE id = $${paramIndex}
                    RETURNING id, first_name, last_name, email, phone, bio, specialty, role, created_at, updated_at
                `;

                const result = await client.query(query, updateValues);
                await client.query("COMMIT");

                return result.rows[0];
            } catch (error) {
                await client.query("ROLLBACK");
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(500, error.message);
        }
    }

    async verifyUser(token) {
        try {
            const payload = verifyToken(token);
            const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
                payload.id,
            ]);

            if (userResult.rowCount === 0) {
                throw new HttpException(404, "Kullanıcı bulunamadı");
            }

            const user = userResult.rows[0];
            return user;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(500, error.message || "Kullanıcı doğrulanırken hata oluştu");
        }
    }

    async verifyEmailOtp(email, code) {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            throw new HttpException(404, "Kullanıcı bulunamadı");
        }

        const user = result.rows[0];

        // Backward compatibility: check both columns
        const isEmailVerified = user.is_email_verified ?? user.is_verified;
        if (isEmailVerified) {
            throw new HttpException(400, "E-posta zaten doğrulanmış");
        }

        if (user.email_verify_code !== code) {
            throw new HttpException(400, "Doğrulama kodu hatalı");
        }

        const now = new Date();
        const codeCreatedAt = new Date(user.email_verify_code_created_at);
        const diffMs = now - codeCreatedAt;
        const diffMinutes = diffMs / (1000 * 60);

        if (diffMinutes > 3) {
            throw new HttpException(400, "Doğrulama kodu süresi dolmuş");
        }

        await pool.query(
            `
            UPDATE users 
            SET is_email_verified = true, is_verified = true, email_verify_code = NULL, email_verify_code_created_at = NULL
            WHERE email = $1
            `,
            [email]
        );

        return { message: "E-posta başarıyla doğrulandı" };
    }

    async verifySmsOtp(email, code) {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            throw new HttpException(404, "Kullanıcı bulunamadı");
        }

        const user = result.rows[0];

        if (user.is_sms_verified === true) {
            throw new HttpException(400, "SMS zaten doğrulanmış");
        }

        if (user.sms_verify_code !== code) {
            throw new HttpException(400, "Doğrulama kodu hatalı");
        }

        const now = new Date();
        const codeCreatedAt = new Date(user.sms_verify_code_created_at);
        const diffMs = now - codeCreatedAt;
        const diffMinutes = diffMs / (1000 * 60);

        if (diffMinutes > 3) {
            throw new HttpException(400, "Doğrulama kodu süresi dolmuş");
        }

        await pool.query(
            `
            UPDATE users 
            SET is_sms_verified = true, sms_verify_code = NULL, sms_verify_code_created_at = NULL
            WHERE email = $1
            `,
            [email]
        );

        // After SMS verification, generate tokens
        const accessToken = generateAccessToken({ id: user.id, role: "user" });
        const refreshToken = generateRefreshToken({ id: user.id, role: "user" });
        
        return { 
            message: "SMS başarıyla doğrulandı",
            accessToken,
            refreshToken
        };
    }

    async resendSmsVerification(email) {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            throw new HttpException(404, "Kullanıcı bulunamadı");
        }

        const user = result.rows[0];

        if (user.is_sms_verified === true) {
            throw new HttpException(400, "SMS zaten doğrulanmış");
        }

        const now = new Date();

        if (user.sms_verify_code_created_at) {
            const diffMs = now - new Date(user.sms_verify_code_created_at);
            const diffMinutes = diffMs / (1000 * 60);

            // Son gönderim üzerinden 2 dakika geçmedi ise
            if (diffMinutes < 2) {
                throw new HttpException(
                    429,
                    "Yeni bir SMS doğrulama kodu istemeden önce lütfen birkaç dakika bekleyin."
                );
            }
        }

        const newCode = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
        const newCreatedAt = new Date();

        await pool.query(
            `
            UPDATE users 
            SET sms_verify_code = $1, sms_verify_code_created_at = $2
            WHERE email = $3
            `,
            [newCode, newCreatedAt, email]
        );

        // Send SMS
        const phoneNumber = user.phone;
        if (!phoneNumber) {
            throw new HttpException(400, "SMS doğrulaması için kayıtlı bir telefon numarası bulunamadı.");
        }
        await sendSms({ msg: `RandevuHazır doğrulama kodunuz: ${newCode}. Kod 3 dakika geçerlidir.`, no: phoneNumber });

        return { message: "Yeni bir SMS doğrulama kodu gönderildi." };
    }

}