"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_1 = require("../utils/jwt");
/**
 * Protege rutas administrativas exigiendo un JWT válido en el header
 * Authorization: Bearer <token>
 */
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No autorizado. Token no proporcionado." });
    }
    const token = header.split(" ")[1];
    try {
        const payload = (0, jwt_1.verifyAdminToken)(token);
        req.admin = payload;
        next();
    }
    catch {
        return res.status(401).json({ error: "Token inválido o expirado." });
    }
}
