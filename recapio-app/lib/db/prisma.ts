import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Programmatically append connection_limit=1 to prevent connection exhaustion in serverless environment
const getDatabaseUrl = () => {
  let url = process.env.DATABASE_URL || "";
  if (url && !url.includes("connection_limit=")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}connection_limit=1`;
  }
  return url;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
