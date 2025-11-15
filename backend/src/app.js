import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import "dotenv/config";

import authRoutes from "./routes/auth-routes.js";
import subscriptionRoutes from "./routes/subscription-routes.js";

import errorHandler from "./middleware/error-handler.js";
import { apiLimiter } from "./middleware/rate-limiter.js";
import requestTimeout from "./middleware/timeout.js";



const app = express();
const port = process.env.PORT || 1234;

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(morgan("tiny"));
app.use(cookieParser());
app.use(requestTimeout);
app.use(apiLimiter);



app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);



app.use(errorHandler);


app.listen(port, () => {
    console.log("🚀 Server is running on port 1234");
})