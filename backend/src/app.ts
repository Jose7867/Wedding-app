import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";

import authRoutes from "./routes/auth.routes";
import invitationsRoutes from "./routes/invitations.routes";
import guestsRoutes from "./routes/guests.routes";
import attendanceRoutes from "./routes/attendance.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import confirmationsRoutes from "./routes/confirmations.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/invitations", invitationsRoutes);
app.use("/api/guests", guestsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/confirmations", confirmationsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
