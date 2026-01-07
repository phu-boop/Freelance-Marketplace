import { PrismaClient } from '@prisma/client';

async function seed() {
    const prisma = new PrismaClient();

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
    }
}

seed();
