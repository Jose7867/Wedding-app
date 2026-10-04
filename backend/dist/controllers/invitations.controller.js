"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByCode = getByCode;
exports.list = list;
exports.getById = getById;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.confirm = confirm;
const zod_1 = require("zod");
const prisma_1 = require("../utils/prisma");
const codeGenerator_1 = require("../utils/codeGenerator");
/**
 * GET /api/invitations/:codigo
 * Endpoint PÚBLICO usado por los invitados para verificar su invitación.
 * Solo expone los datos necesarios; nunca información administrativa.
 */
async function getByCode(req, res, next) {
    try {
        const codigo = req.params.codigo.trim().toUpperCase();
        const invitation = await prisma_1.prisma.invitation.findUnique({
            where: { codigo },
            include: { guests: { select: { id: true, nombre: true, tipo: true, presente: true } } },
        });
        if (!invitation) {
            return res.status(404).json({
                error: "El código ingresado no es válido. Por favor verifica tu invitación.",
            });
        }
        const principal = invitation.guests.find((g) => g.tipo === "principal");
        const acompanantes = invitation.guests.filter((g) => g.tipo === "acompanante");
        res.json({
            id: invitation.id,
            codigo: invitation.codigo,
            estado: invitation.estado,
            codigoVerificacion: invitation.codigoVerificacion,
            guests: invitation.guests,
            invitadoPrincipal: principal?.nombre ?? invitation.nombrePrincipal,
            acompanantes: acompanantes.map((a) => a.nombre),
            totalInvitados: invitation.guests.length,
            mensaje: invitation.mensaje ??
                "Nos alegra mucho poder compartir este momento contigo.",
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/invitations
 * ADMIN. Lista invitaciones con filtros y búsqueda.
 */
async function list(req, res, next) {
    try {
        const { search, estado } = req.query;
        const invitations = await prisma_1.prisma.invitation.findMany({
            where: {
                AND: [
                    estado ? { estado: estado } : {},
                    search
                        ? {
                            OR: [
                                { nombrePrincipal: { contains: search, mode: "insensitive" } },
                                { codigo: { contains: search, mode: "insensitive" } },
                                { codigoVerificacion: { contains: search, mode: "insensitive" } },
                            ],
                        }
                        : {},
                ],
            },
            include: { guests: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(invitations.map((inv) => ({
            id: inv.id,
            codigo: inv.codigo,
            codigoVerificacion: inv.codigoVerificacion,
            nombrePrincipal: inv.nombrePrincipal,
            estado: inv.estado,
            totalInvitados: inv.guests.length,
            presentes: inv.guests.filter((g) => g.presente).length,
            acompanantes: inv.guests.filter((g) => g.tipo === "acompanante").length,
        })));
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/invitations/admin/:id
 * ADMIN. Detalle completo de una invitación.
 */
async function getById(req, res, next) {
    try {
        const invitation = await prisma_1.prisma.invitation.findUnique({
            where: { id: req.params.id },
            include: { guests: true },
        });
        if (!invitation)
            return res.status(404).json({ error: "Invitación no encontrada." });
        res.json(invitation);
    }
    catch (err) {
        next(err);
    }
}
const createSchema = zod_1.z.object({
    codigo: zod_1.z.string().min(3).optional(),
    nombrePrincipal: zod_1.z.string().min(1),
    mensaje: zod_1.z.string().optional(),
    acompanantes: zod_1.z.array(zod_1.z.string().min(1)).optional().default([]),
});
/**
 * POST /api/invitations
 * ADMIN. Crea una nueva invitación con su invitado principal y acompañantes.
 */
async function create(req, res, next) {
    try {
        const data = createSchema.parse(req.body);
        const codigo = (data.codigo ?? (await (0, codeGenerator_1.generateUniqueCode)())).toUpperCase();
        const exists = await prisma_1.prisma.invitation.findUnique({ where: { codigo } });
        if (exists) {
            return res.status(409).json({ error: "El código ya existe. Elige otro." });
        }
        const invitation = await prisma_1.prisma.invitation.create({
            data: {
                codigo,
                nombrePrincipal: data.nombrePrincipal,
                mensaje: data.mensaje,
                guests: {
                    create: [
                        { nombre: data.nombrePrincipal, tipo: "principal" },
                        ...data.acompanantes.map((nombre) => ({ nombre, tipo: "acompanante" })),
                    ],
                },
            },
            include: { guests: true },
        });
        res.status(201).json(invitation);
    }
    catch (err) {
        next(err);
    }
}
const updateSchema = zod_1.z.object({
    nombrePrincipal: zod_1.z.string().min(1).optional(),
    mensaje: zod_1.z.string().optional(),
    estado: zod_1.z.enum(["pendiente", "confirmada", "presente"]).optional(),
});
/**
 * PUT /api/invitations/:id
 * ADMIN. Actualiza los datos generales de una invitación.
 */
async function update(req, res, next) {
    try {
        const data = updateSchema.parse(req.body);
        const invitation = await prisma_1.prisma.invitation.update({
            where: { id: req.params.id },
            data,
            include: { guests: true },
        });
        res.json(invitation);
    }
    catch (err) {
        next(err);
    }
}
/**
 * DELETE /api/invitations/:id
 * ADMIN. Elimina una invitación y sus invitados asociados (cascade).
 */
async function remove(req, res, next) {
    try {
        await prisma_1.prisma.invitation.delete({ where: { id: req.params.id } });
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}
const confirmSchema = zod_1.z.object({
    guests: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().uuid(),
        nombre: zod_1.z.string().min(1),
    })),
});
/**
 * POST /api/invitations/:codigo/confirm
 * Endpoint PÚBLICO para confirmar la asistencia y nombres del grupo de invitados.
 * Genera el código de verificación único y el estado "confirmada".
 */
async function confirm(req, res, next) {
    try {
        const codigo = req.params.codigo.trim().toUpperCase();
        const { guests } = confirmSchema.parse(req.body);
        const invitation = await prisma_1.prisma.invitation.findUnique({
            where: { codigo },
            include: { guests: true },
        });
        if (!invitation) {
            return res.status(404).json({ error: "Invitación no encontrada." });
        }
        if (invitation.estado === "presente") {
            return res.status(400).json({ error: "El ingreso ya ha sido registrado para esta invitación." });
        }
        const validIds = new Set(invitation.guests.map((g) => g.id));
        const allBelong = guests.every((g) => validIds.has(g.id));
        if (!allBelong) {
            return res.status(400).json({ error: "Uno o más invitados no corresponden a esta invitación." });
        }
        // Actualizamos los nombres de los invitados asociados en una transacción
        await prisma_1.prisma.$transaction(guests.map((g) => prisma_1.prisma.guest.update({
            where: { id: g.id },
            data: { nombre: g.nombre },
        })));
        // Obtener el nombre del invitado principal actualizado
        const updatedPrincipal = guests.find((g) => {
            const original = invitation.guests.find((orig) => orig.id === g.id);
            return original?.tipo === "principal";
        });
        // Generamos un código de verificación si no existe
        let codigoVerificacion = invitation.codigoVerificacion;
        if (!codigoVerificacion) {
            codigoVerificacion = await (0, codeGenerator_1.generateVerificationCode)();
        }
        // Actualizamos la invitación
        const updatedInvitation = await prisma_1.prisma.invitation.update({
            where: { id: invitation.id },
            data: {
                estado: "confirmada",
                codigoVerificacion,
                nombrePrincipal: updatedPrincipal ? updatedPrincipal.nombre : invitation.nombrePrincipal,
            },
            include: { guests: true },
        });
        const principal = updatedInvitation.guests.find((g) => g.tipo === "principal");
        const acompanantes = updatedInvitation.guests.filter((g) => g.tipo === "acompanante");
        res.json({
            id: updatedInvitation.id,
            codigo: updatedInvitation.codigo,
            estado: updatedInvitation.estado,
            codigoVerificacion: updatedInvitation.codigoVerificacion,
            guests: updatedInvitation.guests,
            invitadoPrincipal: principal?.nombre ?? updatedInvitation.nombrePrincipal,
            acompanantes: acompanantes.map((a) => a.nombre),
            totalInvitados: updatedInvitation.guests.length,
            mensaje: updatedInvitation.mensaje ??
                "Nos alegra mucho poder compartir este momento contigo.",
        });
    }
    catch (err) {
        next(err);
    }
}
