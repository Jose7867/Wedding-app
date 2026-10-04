import { Request, Response, NextFunction } from "express";
import { verifyAdminToken, AdminTokenPayload } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  admin?: AdminTokenPayload;
}

/**
 * Protege rutas administrativas exigiendo un JWT válido en el header
 * Authorization: Bearer <token>
 */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado. Token no proporcionado." });
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyAdminToken(token);
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
}
