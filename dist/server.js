import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import serverless from "serverless-http";
import { connectDB } from "./config/db";
import AuthRoutes from "./routes/authRoutes";
import { sendResponse } from "./middleware/responseMiddleware";
import productRoutes from "./routes/productRoutes";
import dealRoutes from "./routes/dealRoutes";
import optionRoutes from "./routes/optionRoutes";
import optionGroupRoutes from "./routes/optionGroupRoutes";
import orderRoutes from "./routes/orderRoutes";
dotenv.config();
const app = express();
// Middleware
app.use(cors());
const isProduction = process.env.NODE_ENV === "production";
app.use(helmet({
    contentSecurityPolicy: isProduction,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(sendResponse);
// Routes
app.get("/", (_req, res) => {
    res.send("🚀 Server running with MongoDB (serverless)");
});
app.use("/api/auth", AuthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/options", optionRoutes);
app.use("/api/option-groups", optionGroupRoutes);
app.use("/api/orders", orderRoutes);
// Connect to MongoDB once (serverless safe)
connectDB().then(() => console.log("✅ MongoDB connected"));
// Export app wrapped in serverless handler
export const handler = serverless(app);
