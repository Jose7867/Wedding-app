import { Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import type { Guest } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { AuthenticatedRequest } from "../middleware/auth";

/**
 * POST /api/attendance/:guestId
 * ADMIN. Marca a un invitado individual como presente.
 * Una persona solo puede registrar asistencia una vez.
 */
export async function markGuestPresent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const guestId = req.params.guestId;

    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
    });

    if (!guest) {
      return res.status(404).json({
        error: "Invitado no encontrado.",
      });
    }

    // Protección adicional: si ya figura como presente,
    // no se vuelve a registrar asistencia.
    if (guest.presente) {
      return res.json({
        message: "La asistencia de esta persona ya fue registrada.",
        alreadyRegistered: true,
        guest,
      });
    }

    const now = new Date();

    try {
      const result = await prisma.$transaction(async (tx) => {
        const updatedGuest = await tx.guest.update({
          where: { id: guest.id },
          data: {
            presente: true,
            horaIngreso: now,
          },
        });

        await tx.attendanceRecord.create({
          data: {
            guestId: guest.id,
            administradorId: req.admin!.id,
            fechaHora: now,
          },
        });

        const siblings = await tx.guest.findMany({
          where: {
            invitationId: guest.invitationId,
          },
        });

        if (siblings.every((g: Guest) => g.presente)) {
          await tx.invitation.update({
            where: {
              id: guest.invitationId,
            },
            data: {
              estado: "presente",
            },
          });
        }

        return updatedGuest;
      });

      return res.json({
        message: "Asistencia registrada correctamente.",
        alreadyRegistered: false,
        guest: result,
      });
    } catch (err) {
      // Si dos solicitudes intentan registrar al mismo invitado
      // prácticamente al mismo tiempo, la restricción UNIQUE
      // de guest_id protege la base de datos.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        const currentGuest = await prisma.guest.findUnique({
          where: { id: guest.id },
        });

        return res.json({
          message: "La asistencia de esta persona ya fue registrada.",
          alreadyRegistered: true,
          guest: currentGuest,
        });
      }

      throw err;
    }
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/attendance/invitation/:invitationId/all
 * ADMIN. Marca como presentes únicamente a las personas
 * que todavía no tienen asistencia registrada.
 */
export async function markAllPresent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const invitationId = req.params.invitationId;

    const guests = await prisma.guest.findMany({
      where: {
        invitationId,
      },
    });

    if (guests.length === 0) {
      return res.status(404).json({
        error: "Invitación no encontrada.",
      });
    }

    const pendingGuests = guests.filter((guest) => !guest.presente);

    // Todos ya estaban registrados.
    if (pendingGuests.length === 0) {
      return res.json({
        message: "Todos los invitados de esta invitación ya tienen asistencia registrada.",
        registrados: 0,
        yaRegistrados: guests.length,
      });
    }

    const now = new Date();

    try {
      await prisma.$transaction(async (tx) => {
        await tx.guest.updateMany({
          where: {
            id: {
              in: pendingGuests.map((guest) => guest.id),
            },
          },
          data: {
            presente: true,
            horaIngreso: now,
          },
        });

        for (const guest of pendingGuests) {
          await tx.attendanceRecord.create({
            data: {
              guestId: guest.id,
              administradorId: req.admin!.id,
              fechaHora: now,
            },
          });
        }

        await tx.invitation.update({
          where: {
            id: invitationId,
          },
          data: {
            estado: "presente",
          },
        });
      });

      return res.json({
        message: `Asistencia registrada para ${pendingGuests.length} persona(s).`,
        registrados: pendingGuests.length,
        yaRegistrados: guests.length - pendingGuests.length,
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        return res.status(409).json({
          error:
            "Una o más personas ya tenían su asistencia registrada. Actualiza la lista e inténtalo nuevamente.",
        });
      }

      throw err;
    }
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/attendance
 * ADMIN. Historial completo de asistencia registrada.
 */
export async function listAttendance(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const records = await prisma.attendanceRecord.findMany({
      include: {
        guest: {
          include: {
            invitation: true,
          },
        },
        administrador: {
          select: {
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: {
        fechaHora: "desc",
      },
    });

    res.json(
      records.map((r) => ({
        id: r.id,
        nombre: r.guest.nombre,
        codigo: r.guest.invitation.codigo,
        horaIngreso: r.fechaHora,
        registradoPor: r.administrador.nombre,
      }))
    );
  } catch (err) {
    next(err);
  }
}
