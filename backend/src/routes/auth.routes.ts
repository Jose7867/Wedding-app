import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, logout } from "../controllers/auth.controller";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Demasiados intentos de inicio de sesión. Intenta más tarde." },
});

router.post("/login", loginLimiter, login);
router.post("/logout", logout);

export default router;
