import prisma from "../../prisma/prisma";

export async function getHealthStatus() {
  await prisma.$queryRaw`SELECT 1`;

  return {
    status: "OK",
    database: "Connected",
    timestamp: new Date().toISOString(),
  };
}