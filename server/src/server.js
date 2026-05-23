import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

import authRoutes from "./routes/auth.js";
import bargainRoutes from "./routes/bargains.js";
import cartRoutes from "./routes/cart.js";
import categoryRoutes from "./routes/categories.js";
import orderRoutes from "./routes/orders.js";
import productRoutes from "./routes/products.js";
import statsRoutes from "./routes/stats.js";
import { connectDB, mongoHealth } from "./configs/db.js";
import { seedDefaultAdmin } from "./helpers/seed.helper.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const oldAppPath = path.resolve(__dirname, "..", "..", process.env.OLD_ASPNET_APP_PATH || "");
app.use("/Uploads", express.static(path.join(oldAppPath, "Uploads")));
app.use("/Image", express.static(path.join(oldAppPath, "Image")));
app.use("/static/uploads", express.static(path.resolve(__dirname, "..", "uploads")));

app.get("/api/health", (_req, res) => {
  res.json(mongoHealth());
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bargains", bargainRoutes);
app.use("/api/stats", statsRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(seedDefaultAdmin)
  .then(() => {
    app.listen(port, () => {
      console.log(`API running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Cannot start API:", error.message);
    process.exit(1);
  });
