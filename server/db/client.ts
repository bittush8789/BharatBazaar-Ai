import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export const db = globalThis.prismaGlobal || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = db;
}
