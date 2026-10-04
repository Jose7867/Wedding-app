"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatistics = getStatistics;
const prisma_1 = require("../utils/prisma");
/**
 * GET /api/dashboard/statistics
 * ADMIN. Resumen general para las tarjetas del dashboard.
 */
async function getStatistics(_req, res, next) {
    try {
        const [totalInvitaciones, totalInvitados, presentes, confirmadas, pendientes] = await Promise.all([
            prisma_1.prisma.invitation.count(),
            prisma_1.prisma.guest.count(),
            prisma_1.prisma.guest.count({ where: { presente: true } }),
            prisma_1.prisma.invitation.count({ where: { estado: "confirmada" } }),
            prisma_1.prisma.invitation.count({ where: { estado: "pendiente" } }),
        ]);
        res.json({
            invitaciones: totalInvitaciones,
            invitados: totalInvitados,
            confirmados: confirmadas,
            presentes,
            pendientes,
            pendientesDeLlegada: totalInvitados - presentes,
        });
    }
    catch (err) {
        next(err);
    }
}
