import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { Guest } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { generateUniqueCode, generateVerificationCode } from "../utils/codeGenerator";

/**
 * GET /api/invitations/:codigo
 * Endpoint PÚBLICO usado por los invitados para verificar su invitación.
 * Solo expone los datos necesarios; nunca información administrativa.
 */
export async function getByCode(req: Request, res: Response, next: NextFunction) {
  try {
    const codigo = req.params.codigo.trim().toUpperCase();

    const invitation = await prisma.invitation.findUnique({
      where: { codigo },
      include: { guests: { select: { id: true, nombre: true, tipo: true, presente: true } } },
    });

    if (!invitation) {
      return res.status(404).json({
        error: "El código ingresado no es válido. Por favor verifica tu invitación.",
      });
    }

    const principal = invitation.guests.find((g: any) => g.tipo === "principal");
    const acompanantes = invitation.guests.filter((g: any) => g.tipo === "acompanante");

    res.json({
      id: invitation.id,
      codigo: invitation.codigo,
      estado: invitation.estado,
      codigoVerificacion: (invitation as any).codigoVerificacion,
      guests: invitation.guests,
      invitadoPrincipal: principal?.nombre ?? invitation.nombrePrincipal,
      acompanantes: acompanantes.map((a) => a.nombre),
      totalInvitados: invitation.guests.length,
      mensaje:
        invitation.mensaje ??
        "Nos alegra mucho poder compartir este momento contigo.",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/invitations
 * ADMIN. Lista invitaciones con filtros y búsqueda.
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, estado } = req.query as { search?: string; estado?: string };

    const invitations = await prisma.invitation.findMany({
      where: {
        AND: [
          estado ? { estado: estado as any } : {},
          search
            ? {
                OR: [
                  { nombrePrincipal: { contains: search, mode: "insensitive" } as any },
                  { codigo: { contains: search, mode: "insensitive" } as any },
                  { codigoVerificacion: { contains: search, mode: "insensitive" } as any },
                ],
              }
            : {},
        ],
      },
      include: { guests: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      invitations.map((inv: any) => ({
        id: inv.id,
        codigo: inv.codigo,
        codigoVerificacion: inv.codigoVerificacion,
        nombrePrincipal: inv.nombrePrincipal,
        estado: inv.estado,
        totalInvitados: inv.guests.length,
        presentes: inv.guests.filter((g: Guest) => g.presente).length,
        acompanantes: inv.guests.filter((g: Guest) => g.tipo === "acompanante").length,
      }))
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/invitations/admin/:id
 * ADMIN. Detalle completo de una invitación.
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id: req.params.id },
      include: { guests: true },
    });

    if (!invitation) return res.status(404).json({ error: "Invitación no encontrada." });

    res.json(invitation);
  } catch (err) {
    next(err);
  }
}

const createSchema = z.object({
  codigo: z.string().min(3).optional(),
  nombrePrincipal: z.string().min(1),
  mensaje: z.string().optional(),
  acompanantes: z.array(z.string().min(1)).optional().default([]),
});

/**
 * POST /api/invitations
 * ADMIN. Crea una nueva invitación con su invitado principal y acompañantes.
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const codigo = (data.codigo ?? (await generateUniqueCode())).toUpperCase();

    const exists = await prisma.invitation.findUnique({ where: { codigo } });
    if (exists) {
      return res.status(409).json({ error: "El código ya existe. Elige otro." });
    }

    const invitation = await prisma.invitation.create({
      data: {
        codigo,
        nombrePrincipal: data.nombrePrincipal,
        mensaje: data.mensaje,
        guests: {
          create: [
            { nombre: data.nombrePrincipal, tipo: "principal" },
            ...data.acompanantes.map((nombre) => ({ nombre, tipo: "acompanante" as const })),
          ],
        },
      },
      include: { guests: true },
    });

    res.status(201).json(invitation);
  } catch (err) {
    next(err);
  }
}

const updateSchema = z.object({
  nombrePrincipal: z.string().min(1).optional(),
  mensaje: z.string().optional(),
  estado: z.enum(["pendiente", "confirmada", "presente"]).optional(),
});

/**
 * PUT /api/invitations/:id
 * ADMIN. Actualiza los datos generales de una invitación.
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateSchema.parse(req.body);

    const invitation = await prisma.invitation.update({
      where: { id: req.params.id },
      data,
      include: { guests: true },
    });

    res.json(invitation);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/invitations/:id
 * ADMIN. Elimina una invitación y sus invitados asociados (cascade).
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.invitation.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

const confirmSchema = z.object({
  guests: z.array(
    z.object({
      id: z.string().uuid(),
      nombre: z.string().min(1),
    })
  ),
});

/**
 * POST /api/invitations/:codigo/confirm
 * Endpoint PÚBLICO para confirmar la asistencia y nombres del grupo de invitados.
 * Genera el código de verificación único y el estado "confirmada".
 */
export async function confirm(req: Request, res: Response, next: NextFunction) {
  try {
    const codigo = req.params.codigo.trim().toUpperCase();
    const { guests } = confirmSchema.parse(req.body);

    const invitation = await prisma.invitation.findUnique({
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
    await prisma.$transaction(
      guests.map((g) =>
        prisma.guest.update({
          where: { id: g.id },
          data: { nombre: g.nombre },
        })
      )
    );

    // Obtener el nombre del invitado principal actualizado
    const updatedPrincipal = guests.find((g) => {
      const original = invitation.guests.find((orig) => orig.id === g.id);
      return original?.tipo === "principal";
    });

    // Generamos un código de verificación si no existe
    let codigoVerificacion = invitation.codigoVerificacion;
    if (!codigoVerificacion) {
      codigoVerificacion = await generateVerificationCode();
    }

    // Actualizamos la invitación
    const updatedInvitation = await prisma.invitation.update({
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
      mensaje:
        updatedInvitation.mensaje ??
        "Nos alegra mucho poder compartir este momento contigo.",
    });
  } catch (err) {
    next(err);
  }
}
