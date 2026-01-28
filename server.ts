import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
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
const PORT = process.env.PORT || 2000; 

// 1. CORS: Allow both ports (5173 & 5174) just in case
app.use(cors());


const isProduction = process.env.NODE_ENV === "production";

app.use(
  helmet({
    contentSecurityPolicy: isProduction, 
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(sendResponse);

app.get("/", (_req, res) => {
  res.send("🚀 Server running with MongoDB");
});

app.use("/api/auth", AuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/options', optionRoutes);
app.use('/api/option-groups', optionGroupRoutes);
app.use('/api/orders', orderRoutes);

const startServer = async () => {
  try {
     await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server not started due to DB error");
    process.exit(1);
  }
};

startServer();