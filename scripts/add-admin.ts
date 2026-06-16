import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: npx tsx scripts/add-admin.ts <email>");
    console.error("Ej:   npx tsx scripts/add-admin.ts personal@face.unt.edu.ar");
    process.exit(1);
  }

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, name: email.split("@")[0] },
  });

  console.log(`✓ Admin agregado: ${admin.email}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
