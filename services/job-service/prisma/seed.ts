import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
    { name: 'Development & IT', slug: 'development-it' },
    { name: 'Design & Creative', slug: 'design-creative' },
    { name: 'Sales & Marketing', slug: 'sales-marketing' },
    { name: 'Writing & Translation', slug: 'writing-translation' },
    { name: 'Admin & Customer Support', slug: 'admin-support' },
    { name: 'Finance & Accounting', slug: 'finance-accounting' },
];

const skills = [
    { name: 'React' },
    { name: 'Node.js' },
    { name: 'TypeScript' },
    { name: 'Python' },
    { name: 'Next.js' },
    { name: 'Tailwind CSS' },
    { name: 'Figma' },
    { name: 'Adobe Photoshop' },
    { name: 'SEO' },
    { name: 'Content Writing' },
];

async function main() {
    console.log('Start seeding job service data...');

    for (const category of categories) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: {},
            create: category,
        });
    }

    for (const skill of skills) {
        await prisma.skill.upsert({
            where: { name: skill.name },
            update: {},
            create: skill,
        });
    }

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
