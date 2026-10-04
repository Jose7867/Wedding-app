import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth";
import {
  create,
  list,
  countPending,
  accept,
  reject,
  searchByName,
} from "../controllers/confirmations.controller";

const router = Router();

const publicLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 15,
  message: { error: "Demasiados intentos. Espera unos minutos antes de volver a intentar." },
});

// ── Rutas públicas (para invitados) ──────────────────────────────────
router.post("/", publicLimiter, create);
router.get("/search", publicLimiter, searchByName);

// ── Rutas administrativas ─────────────────────────────────────────────
router.get("/count-pending", requireAuth, countPending);
router.get("/", requireAuth, list);
router.post("/:id/accept", requireAuth, accept);
router.post("/:id/reject", requireAuth, reject);

export default router;
