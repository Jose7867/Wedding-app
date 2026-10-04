"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.logout = logout;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const jwt_1 = require("../utils/jwt");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
async function login(req, res, next) {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const admin = await prisma_1.prisma.administrator.findUnique({ where: { email } });
        // Respuesta genérica para no revelar si el email existe.
        if (!admin) {
            return res.status(401).json({ error: "Credenciales inválidas." });
        }
        const valid = await bcryptjs_1.default.compare(password, admin.passwordHash);
        if (!valid) {
            return res.status(401).json({ error: "Credenciales inválidas." });
        }
        const token = (0, jwt_1.signAdminToken)({ id: admin.id, email: admin.email, nombre: admin.nombre });
        res.json({
            token,
            admin: { id: admin.id, email: admin.email, nombre: admin.nombre },
        });
    }
    catch (err) {
        next(err);
    }
}
async function logout(_req, res) {
    // El logout es manejado por el cliente descartando el token (JWT sin estado).
    res.json({ message: "Sesión cerrada correctamente." });
}
