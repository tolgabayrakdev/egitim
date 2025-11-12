import HttpException from "../exceptions/http-exception.js";

export const verifySimpleCaptcha = (req, res, next) => {
    const { captchaAnswer, captchaSum } = req.body;

    if (typeof captchaAnswer !== "number" || typeof captchaSum !== "number") {
        return next(new HttpException(400, "Güvenlik doğrulama bilgileri eksik."));
    }

    if (captchaAnswer !== captchaSum) {
        return next(new HttpException(400, "Güvenlik sorusu cevabı yanlış."));
    }

    next();
};