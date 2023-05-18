import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prismaClient = globalThis.prisma || createPrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prismaClient;

function createPrismaClient() {
  const client = new PrismaClient();
  // add middleware here
  return client;
}
