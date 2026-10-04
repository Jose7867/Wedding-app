"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listByInvitation = listByInvitation;
exports.addGuest = addGuest;
exports.updateGuest = updateGuest;
exports.removeGuest = removeGuest;
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
/**
 * GET /api/invitations/:id/guests
 * ADMIN. Lista los invitados (principal + acompañantes) de una invitación.
 */
async function listByInvitation(req, res, next) {
    try {
        const guests = await prisma_1.prisma.guest.findMany({
            where: { invitationId: req.params.id },
            orderBy: { createdAt: "asc" },
        });
        res.json(guests);
    }
    catch (err) {
        next(err);
    }
}
const addGuestSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1),
    tipo: zod_1.z.enum(["principal", "acompanante"]).default("acompanante"),
});
/**
 * POST /api/invitations/:id/guests
 * ADMIN. Agrega un acompañante a una invitación existente.
 */
async function addGuest(req, res, next) {
    try {
        const data = addGuestSchema.parse(req.body);
        const guest = await prisma_1.prisma.guest.create({
            data: { ...data, invitationId: req.params.id },
        });
        res.status(201).json(guest);
    }
    catch (err) {
        next(err);
    }
}
const updateGuestSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1).optional(),
    tipo: zod_1.z.enum(["principal", "acompanante"]).optional(),
});
/**
 * PUT /api/guests/:id
 * ADMIN. Edita el nombre o tipo de un invitado.
 */
async function updateGuest(req, res, next) {
    try {
        const data = updateGuestSchema.parse(req.body);
        const guest = await prisma_1.prisma.guest.update({ where: { id: req.params.id }, data });
        res.json(guest);
    }
    catch (err) {
        next(err);
    }
}
/**
 * DELETE /api/guests/:id
 * ADMIN. Elimina un acompañante.
 */
async function removeGuest(req, res, next) {
    try {
        await prisma_1.prisma.guest.delete({ where: { id: req.params.id } });
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}
