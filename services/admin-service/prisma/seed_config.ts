import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function seed() {
    const pool = new Pool({ connectionString: 'postgresql://admin:password@postgres:5432/freelance_db?schema=admin' });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    console.log('--- Seeding System Config ---');

    try {
        const config = await prisma.systemConfig.upsert({
            where: { key: 'PLATFORM_FEE_PERCENT' },
            update: {},
            create: {
                key: 'PLATFORM_FEE_PERCENT',
                value: '10',
            }
        });
        console.log('✅ PLATFORM_FEE_PERCENT seeded:', config.value);
    } catch (error) {
        console.error('❌ Failed to seed config:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

seed();
