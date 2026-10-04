import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: "Recurso no encontrado." });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Datos inválidos.",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  console.error(err);
  const message = err instanceof Error ? err.message : "Error interno del servidor.";
  res.status(500).json({ error: message });
}
