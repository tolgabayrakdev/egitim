import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.access_token || req.query.token;

        if (token) {
            jwt.verify(token, process.env.JWT_SECRET_KEY, (error, user) => {
                if (error) {
                    return res.status(403).json({ message: "Token geçerli değil!" });
                }
                req.user = user;
                next();
            });
        } else {
            res.status(401).json({ message: "Kimlik doğrulaması yapılmadı" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};