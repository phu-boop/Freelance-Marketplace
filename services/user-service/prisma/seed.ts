import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Start seeding users...');

    // Create a Freelancer
    await prisma.user.upsert({
        where: { email: 'freelancer@example.com' },
        update: {},
        create: {
            email: 'freelancer@example.com',
            firstName: 'John',
            lastName: 'Freelancer',
            roles: ['FREELANCER'],
            title: 'Full Stack Developer',
            overview: 'Experienced developer with 5 years of experience in React and Node.js.',
            hourlyRate: 50,
            skills: ['React', 'Node.js', 'TypeScript'],
            isAvailable: true,
            availableConnects: 50,
        },
    });

    // Create a Client
    await prisma.user.upsert({
        where: { email: 'client@example.com' },
        update: {},
        create: {
            email: 'client@example.com',
            firstName: 'Jane',
            lastName: 'Client',
            roles: ['CLIENT'],
            companyName: 'Tech Solutions Inc.',
            isPaymentVerified: true,
        },
    });

    // Create an Admin
    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            firstName: 'System',
            lastName: 'Admin',
            roles: ['ADMIN'],
        },
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
