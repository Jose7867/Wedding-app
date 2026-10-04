import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { signAdminToken } from "../utils/jwt";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const admin = await prisma.administrator.findUnique({ where: { email } });

    // Respuesta genérica para no revelar si el email existe.
    if (!admin) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const token = signAdminToken({ id: admin.id, email: admin.email, nombre: admin.nombre });

    res.json({
      token,
      admin: { id: admin.id, email: admin.email, nombre: admin.nombre },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  // El logout es manejado por el cliente descartando el token (JWT sin estado).
  res.json({ message: "Sesión cerrada correctamente." });
}
