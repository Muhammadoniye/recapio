import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Programmatically append connection_limit=1 and pgbouncer=true to prevent PgBouncer connection issues
const getDatabaseUrl = () => {
  const rawUrl = process.env.DATABASE_URL || "";
  if (!rawUrl) return rawUrl;

  try {
    const urlObj = new URL(rawUrl);
    urlObj.searchParams.set("pgbouncer", "true");
    urlObj.searchParams.set("connection_limit", "1");
    return urlObj.toString();
  } catch (err) {
    console.error("Failed to parse DATABASE_URL:", err);
    return rawUrl;
  }
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
