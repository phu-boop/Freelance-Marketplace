import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
    { name: 'Development & IT', slug: 'development-it', description: 'Software, web, and mobile development' },
    { name: 'Design & Creative', slug: 'design-creative', description: 'Graphic, UI/UX, and brand design' },
    { name: 'Sales & Marketing', slug: 'sales-marketing', description: 'SEO, social media, and digital marketing' },
    { name: 'Writing & Translation', slug: 'writing-translation', description: 'Content writing, editing, and translation' },
    { name: 'Admin & Customer Support', slug: 'admin-support', description: 'Virtual assistants and customer service' },
    { name: 'Finance & Accounting', slug: 'finance-accounting', description: 'Bookkeeping and financial analysis' },
];

const skills = [
    { name: 'React', slug: 'react' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'Python', slug: 'python' },
    { name: 'Next.js', slug: 'nextjs' },
    { name: 'Tailwind CSS', slug: 'tailwind-css' },
    { name: 'Figma', slug: 'figma' },
    { name: 'Adobe Photoshop', slug: 'photoshop' },
    { name: 'SEO', slug: 'seo' },
    { name: 'Content Writing', slug: 'content-writing' },
];

async function main() {
    console.log('Start seeding common data...');

    for (const category of categories) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: {},
            create: category,
        });
    }

    for (const skill of skills) {
        await prisma.skill.upsert({
            where: { slug: skill.slug },
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
