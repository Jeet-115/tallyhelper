import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import companyMasterRoutes from "./routes/companymasterroutes.js";
import gstinNumberRoutes from "./routes/gstinnumberroutes.js";
import gstr2BImportRoutes from "./routes/gstr2bimportroutes.js";


dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://tallyprimesupport.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        // Allow no-origin (like health checks) and known origins
        callback(null, true);
      } else {
        console.warn("❌ CORS blocked for origin:", origin); // optional log
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  })
);

app.use(express.json());

// Routes
app.get("/health", (req, res) => {
  console.log("🩺 Health check at:", new Date().toLocaleString());
  res.status(200).send("OK");
});

app.use("/api/company-master", companyMasterRoutes);
app.use("/api/gstin-numbers", gstinNumberRoutes);
app.use("/api/gstr2b-imports", gstr2BImportRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
