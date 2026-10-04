import { Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AuthenticatedRequest } from "../middleware/auth";

/**
 * GET /api/dashboard/statistics
 * ADMIN. Resumen general para las tarjetas del dashboard.
 */
export async function getStatistics(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const [totalInvitaciones, totalInvitados, presentes, confirmadas, pendientes, solicitudesPendientes] =
      await Promise.all([
        prisma.invitation.count(),
        prisma.guest.count(),
        prisma.guest.count({ where: { presente: true } }),
        prisma.invitation.count({ where: { estado: "confirmada" } }),
        prisma.invitation.count({ where: { estado: "pendiente" } }),
        prisma.confirmationRequest.count({ where: { estado: "pendiente" } }),
      ]);

    res.json({
      invitaciones: totalInvitaciones,
      invitados: totalInvitados,
      confirmados: confirmadas,
      presentes,
      pendientes,
      pendientesDeLlegada: totalInvitados - presentes,
      solicitudesPendientes,
    });
  } catch (err) {
    next(err);
  }
}
