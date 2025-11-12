import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import "dotenv/config";

import errorHandler from "./middleware/error-handler.js";
import { apiLimiter } from "./middleware/rate-limiter.js";
import requestTimeout from "./middleware/timeout.js";



const app = express();
const port = process.env.PORT || 1234;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(requestTimeout);
app.use(apiLimiter);


// Rotalar





app.use(errorHandler);


app.listen(port, () => {
    console.log("🚀 Server is running on port 1234");
})