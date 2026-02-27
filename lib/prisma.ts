import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = `${process.env.DATABASE_URL}`;

// 1. Initialize the standard PostgreSQL connection pool
const pool = new Pool({ connectionString });

// 2. Wrap the pool in Prisma's new Driver Adapter
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 3. Pass the adapter into the constructor to satisfy Prisma v7!
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;