import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

async function main() {
    console.log('Start seeding job service data...');

    const categories = [
        { name: 'Web Development', parentId: null },
        { name: 'Mobile Development', parentId: null },
        { name: 'Design & Creative', parentId: null },
        { name: 'Writing', parentId: null },
        { name: 'Admin Support', parentId: null },
        { name: 'Customer Service', parentId: null },
        { name: 'Marketing', parentId: null },
        { name: 'Accounting', parentId: null },
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { name: cat.name },
            update: {},
            create: {
                name: cat.name,
                slug: slugify(cat.name),
                parentId: cat.parentId
            }
        });
    }

    // Add subcategories
    const webParent = await prisma.category.findUnique({ where: { name: 'Web Development' } });
    if (webParent) {
        const subCategories = ['Frontend', 'Backend', 'Full Stack', 'CMS'];
        for (const sub of subCategories) {
            await prisma.category.upsert({
                where: { name: sub },
                update: {},
                create: {
                    name: sub,
                    slug: slugify(sub),
                    parentId: webParent.id
                }
            });
        }
    }

    const mobileParent = await prisma.category.findUnique({ where: { name: 'Mobile Development' } });
    if (mobileParent) {
        const subCategories = ['iOS', 'Android', 'Cross-platform'];
        for (const sub of subCategories) {
            await prisma.category.upsert({
                where: { name: sub },
                update: {},
                create: {
                    name: sub,
                    slug: slugify(sub),
                    parentId: mobileParent.id
                }
            });
        }
    }

    const designParent = await prisma.category.findUnique({ where: { name: 'Design & Creative' } });
    if (designParent) {
        const subCategories = ['Logo Design', 'UI/UX', 'Illustration', 'Video Editing'];
        for (const sub of subCategories) {
            await prisma.category.upsert({
                where: { name: sub },
                update: {},
                create: {
                    name: sub,
                    slug: slugify(sub),
                    parentId: designParent.id
                }
            });
        }
    }

    console.log('Categories seeded!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
