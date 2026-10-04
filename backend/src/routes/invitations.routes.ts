import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth";
import {
  getByCode,
  list,
  getById,
  create,
  update,
  remove,
  confirm,
} from "../controllers/invitations.controller";
import { listByInvitation, addGuest } from "../controllers/guests.controller";

const router = Router();

const codeCheckLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: {
    error: "Demasiados intentos. Por favor espera unos minutos antes de volver a intentar.",
  },
});

// --- Rutas públicas (para invitados) ---
router.get("/:codigo", codeCheckLimiter, getByCode);
router.post("/:codigo/confirm", codeCheckLimiter, confirm);

// --- Rutas administrativas ---
router.get("/", requireAuth, list);
router.get("/admin/:id", requireAuth, getById);
router.post("/", requireAuth, create);
router.put("/:id", requireAuth, update);
router.delete("/:id", requireAuth, remove);
router.get("/:id/guests", requireAuth, listByInvitation);
router.post("/:id/guests", requireAuth, addGuest);

export default router;
