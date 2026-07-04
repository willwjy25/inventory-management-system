import prisma from "../src/prisma/prisma";
import { roles } from "./seed-data/roles";

async function main() {
  console.log("🌱 Seeding database...");

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role.name,
      },
      update: {
        description: role.description,
      },
      create: role,
    });

    console.log(`✅ Role '${role.name}' seeded.`);
  }

  console.log("🎉 Database seeding completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });