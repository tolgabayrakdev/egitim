import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 250, // 250 istek 15 dakikada 
    message: {
        status: 429,
        message: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.",
    },
    standardHeaders: true, // Rate limit headers'ı döner
    legacyHeaders: false, // X-RateLimit-* başlıklarını kapatır
    skipSuccessfulRequests: false, // Başarılı istekleri de say
    skipFailedRequests: false, // Başarısız istekleri de say
    handler: (req, res) => {
        res.status(429).json({
            status: 429,
            message: "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin."
        });
    }
});


export { apiLimiter };