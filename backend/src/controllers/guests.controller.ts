import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";

/**
 * GET /api/invitations/:id/guests
 * ADMIN. Lista los invitados (principal + acompañantes) de una invitación.
 */
export async function listByInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const guests = await prisma.guest.findMany({
      where: { invitationId: req.params.id },
      orderBy: { createdAt: "asc" },
    });
    res.json(guests);
  } catch (err) {
    next(err);
  }
}

const addGuestSchema = z.object({
  nombre: z.string().min(1),
  tipo: z.enum(["principal", "acompanante"]).default("acompanante"),
});

/**
 * POST /api/invitations/:id/guests
 * ADMIN. Agrega un acompañante a una invitación existente.
 */
export async function addGuest(req: Request, res: Response, next: NextFunction) {
  try {
    const data = addGuestSchema.parse(req.body);

    const guest = await prisma.guest.create({
      data: { ...data, invitationId: req.params.id },
    });

    res.status(201).json(guest);
  } catch (err) {
    next(err);
  }
}

const updateGuestSchema = z.object({
  nombre: z.string().min(1).optional(),
  tipo: z.enum(["principal", "acompanante"]).optional(),
});

/**
 * PUT /api/guests/:id
 * ADMIN. Edita el nombre o tipo de un invitado.
 */
export async function updateGuest(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateGuestSchema.parse(req.body);
    const guest = await prisma.guest.update({ where: { id: req.params.id }, data });
    res.json(guest);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/guests/:id
 * ADMIN. Elimina un acompañante.
 */
export async function removeGuest(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.guest.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
