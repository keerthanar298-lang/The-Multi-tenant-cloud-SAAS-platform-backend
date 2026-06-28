require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const {
  migrateExistingTenantStatus,
} = require("./controllers/tenantController");

const app = express();

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    migrateExistingTenantStatus();
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
};

startServer();

// Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100, // 100 requests per 10 mins
});
app.use("/api", limiter);

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const tenantRoutes = require("./routes/tenantRoutes");

const announcementRoutes = require("./routes/announcementRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const apartmentRoutes = require("./routes/apartmentRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/apartments", apartmentRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
