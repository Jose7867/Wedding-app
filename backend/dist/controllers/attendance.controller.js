"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markGuestPresent = markGuestPresent;
exports.markAllPresent = markAllPresent;
exports.listAttendance = listAttendance;
const prisma_1 = require("../utils/prisma");
/**
 * POST /api/attendance/:guestId
 * ADMIN. Marca a un invitado individual como presente y registra quién lo hizo.
 */
async function markGuestPresent(req, res, next) {
    try {
        const guest = await prisma_1.prisma.guest.findUnique({ where: { id: req.params.guestId } });
        if (!guest)
            return res.status(404).json({ error: "Invitado no encontrado." });
        const now = new Date();
        const updated = await prisma_1.prisma.guest.update({
            where: { id: guest.id },
            data: { presente: true, horaIngreso: now },
        });
        await prisma_1.prisma.attendanceRecord.create({
            data: {
                guestId: guest.id,
                administradorId: req.admin.id,
                fechaHora: now,
            },
        });
        // Si todos los invitados de la invitación están presentes, marcar la invitación como "presente".
        const siblings = await prisma_1.prisma.guest.findMany({ where: { invitationId: guest.invitationId } });
        if (siblings.every((g) => g.presente)) {
            await prisma_1.prisma.invitation.update({
                where: { id: guest.invitationId },
                data: { estado: "presente" },
            });
        }
        res.json({ message: "Asistencia registrada correctamente.", guest: updated });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/attendance/invitation/:invitationId/all
 * ADMIN. Marca a todos los invitados de una invitación como presentes de una sola vez.
 */
async function markAllPresent(req, res, next) {
    try {
        const invitationId = req.params.invitationId;
        const guests = await prisma_1.prisma.guest.findMany({ where: { invitationId } });
        if (guests.length === 0)
            return res.status(404).json({ error: "Invitación no encontrada." });
        const now = new Date();
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.guest.updateMany({
                where: { invitationId },
                data: { presente: true, horaIngreso: now },
            }),
            prisma_1.prisma.invitation.update({
                where: { id: invitationId },
                data: { estado: "presente" },
            }),
            ...guests.map((g) => prisma_1.prisma.attendanceRecord.create({
                data: { guestId: g.id, administradorId: req.admin.id, fechaHora: now },
            })),
        ]);
        res.json({ message: `Asistencia registrada para ${guests.length} invitado(s).` });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/attendance
 * ADMIN. Historial completo de asistencia registrada.
 */
async function listAttendance(_req, res, next) {
    try {
        const records = await prisma_1.prisma.attendanceRecord.findMany({
            include: {
                guest: { include: { invitation: true } },
                administrador: { select: { nombre: true, email: true } },
            },
            orderBy: { fechaHora: "desc" },
        });
        res.json(records.map((r) => ({
            id: r.id,
            nombre: r.guest.nombre,
            codigo: r.guest.invitation.codigo,
            horaIngreso: r.fechaHora,
            registradoPor: r.administrador.nombre,
        })));
    }
    catch (err) {
        next(err);
    }
}
