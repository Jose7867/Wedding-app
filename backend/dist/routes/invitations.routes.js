"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = require("../middleware/auth");
const invitations_controller_1 = require("../controllers/invitations.controller");
const guests_controller_1 = require("../controllers/guests.controller");
const router = (0, express_1.Router)();
const codeCheckLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: {
        error: "Demasiados intentos. Por favor espera unos minutos antes de volver a intentar.",
    },
});
// --- Rutas públicas (para invitados) ---
router.get("/:codigo", codeCheckLimiter, invitations_controller_1.getByCode);
router.post("/:codigo/confirm", codeCheckLimiter, invitations_controller_1.confirm);
// --- Rutas administrativas ---
router.get("/", auth_1.requireAuth, invitations_controller_1.list);
router.get("/admin/:id", auth_1.requireAuth, invitations_controller_1.getById);
router.post("/", auth_1.requireAuth, invitations_controller_1.create);
router.put("/:id", auth_1.requireAuth, invitations_controller_1.update);
router.delete("/:id", auth_1.requireAuth, invitations_controller_1.remove);
router.get("/:id/guests", auth_1.requireAuth, guests_controller_1.listByInvitation);
router.post("/:id/guests", auth_1.requireAuth, guests_controller_1.addGuest);
exports.default = router;
