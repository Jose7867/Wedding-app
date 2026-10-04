import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@emmayjose.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const nombre = process.env.SEED_ADMIN_NAME || "Administrador";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.administrator.upsert({
    where: { email },
    update: {},
    create: { email, nombre, passwordHash },
  });

  console.log(`Administrador creado/actualizado: ${email}`);

  // Invitación de ejemplo
  const existing = await prisma.invitation.findUnique({
    where: { codigo: "BODA-EMMA-001" },
  });

  if (!existing) {
    await prisma.invitation.create({
      data: {
        codigo: "BODA-EMMA-001",
        nombrePrincipal: "Carlos Pérez",
        mensaje: "Nos alegra mucho poder compartir este momento contigo.",
        guests: {
          create: [
            { nombre: "Carlos Pérez", tipo: "principal" },
            { nombre: "María Pérez", tipo: "acompanante" },
            { nombre: "Juan Pérez", tipo: "acompanante" },
          ],
        },
      },
    });
    console.log("Invitación de ejemplo BODA-EMMA-001 creada.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
