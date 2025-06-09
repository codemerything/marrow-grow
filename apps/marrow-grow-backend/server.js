import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { PORT } from "./config/env.js";
import { MONGO_URI } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import seedRoutes from "./routes/seeds.routes.js";
import cookieParser from "cookie-parser";
import playerRoutes from "./routes/players.routes.js";

const app = express();

// CORS OPTIONS
// List of allowed origins

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];

// CORS middleware FIRST!

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
// Auth routes
app.use("/api/auth", authRoutes);

// Seed routes

app.use("/api/seeds", seedRoutes);

// Player routes

app.use("/api/leaderboard", playerRoutes);

app.get("/", (req, res) => {
  res.send("Hello from server");
});

// Global error handler (should be last middleware)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error." });
});

// Connect to DB first, then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
      console.log("Loaded MONGODB_URI:", MONGO_URI);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
