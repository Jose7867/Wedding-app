"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function notFoundHandler(req, res) {
    res.status(404).json({ error: "Recurso no encontrado." });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(err, req, res, next) {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: "Datos inválidos.",
            details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        });
    }
    console.error(err);
    const message = err instanceof Error ? err.message : "Error interno del servidor.";
    res.status(500).json({ error: message });
}
