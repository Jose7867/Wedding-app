import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getStatistics } from "../controllers/dashboard.controller";

const router = Router();

router.get("/statistics", requireAuth, getStatistics);

export default router;
