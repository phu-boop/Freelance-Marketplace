import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Seed Skills
    const skills = [
        'React', 'Node.js', 'TypeScript', 'Next.js', 'PostgreSQL',
        'Flutter', 'Swift', 'Kotlin', 'React Native',
        'Figma', 'Adobe XD', 'Photoshop', 'Illustrator',
        'Python', 'Django', 'FastAPI', 'AWS', 'Docker'
    ];

    const skillMap: Record<string, string> = {};
    for (const skillName of skills) {
        const skill = await prisma.skill.upsert({
            where: { name: skillName },
            update: {},
            create: { name: skillName }
        });
        skillMap[skillName] = skill.id;
    }
    console.log('Skills seeded!');

    // Seed Jobs
    const clientId = '901f6a31-3e22-4cb9-8dbb-2ad1b3a42040'; // Existing User ID
    const frontendCat = await prisma.category.findUnique({ where: { name: 'Frontend' } });
    const backendCat = await prisma.category.findUnique({ where: { name: 'Backend' } });
    const mobileCat = await prisma.category.findUnique({ where: { name: 'Cross-platform' } });
    const uiuxCat = await prisma.category.findUnique({ where: { name: 'UI/UX' } });

    const jobSeeds = [
        {
            title: 'Senior React Developer for Fintech Startup',
            description: 'We are looking for a senior React developer to build a modern fintech dashboard. Experience with TypeScript and high-performance charting is required.',
            budget: 5000,
            type: 'FIXED',
            experienceLevel: 'EXPERT',
            location: 'Remote',
            categoryId: frontendCat?.id,
            skills: ['React', 'TypeScript', 'PostgreSQL']
        },
        {
            title: 'Node.js Backend Engineer for E-commerce Platform',
            description: 'Scale our backend using Node.js and PostgreSQL. Focus on performance and security.',
            budget: 4500,
            type: 'FIXED',
            experienceLevel: 'INTERMEDIATE',
            location: 'Remote',
            categoryId: backendCat?.id,
            skills: ['Node.js', 'PostgreSQL', 'Docker']
        },
        {
            title: 'Mobile App Developer (Flutter)',
            description: 'Build a beautiful, fast cross-platform app for our fitness brand. Design is ready, we need implementation.',
            budget: 3500,
            type: 'FIXED',
            experienceLevel: 'INTERMEDIATE',
            location: 'Remote',
            categoryId: mobileCat?.id,
            skills: ['Flutter', 'FastAPI']
        },
        {
            title: 'Creative UI/UX Designer',
            description: 'Design a clean and intuitive user interface for our new social media platform.',
            budget: 40,
            type: 'HOURLY',
            experienceLevel: 'EXPERT',
            location: 'Remote',
            categoryId: uiuxCat?.id,
            skills: ['Figma', 'Adobe XD', 'Illustrator']
        },
        {
            title: 'Python/Django Developer for Data Mining',
            description: 'Help us extract and process data from various web sources using Python and Django.',
            budget: 3000,
            type: 'FIXED',
            experienceLevel: 'EXPERT',
            location: 'Remote',
            categoryId: backendCat?.id,
            skills: ['Python', 'Django', 'PostgreSQL']
        }
    ];

    const searchUrl = process.env.SEARCH_SERVICE_URL || 'http://search-service:3010';

    for (const jobSeed of jobSeeds) {
        const { skills: jobSkills, ...jobData } = jobSeed;
        const job = await prisma.job.create({
            data: {
                ...jobData,
                client_id: clientId,
                status: 'OPEN',
                skills: {
                    create: jobSkills.map(name => ({
                        skill: { connect: { id: skillMap[name] } }
                    }))
                }
            },
            include: {
                category: true,
                skills: {
                    include: { skill: true }
                }
            }
        });

        console.log(`Job created: ${job.title}`);

        // Sync to Search Service
        try {
            const indexedJob = {
                id: job.id,
                title: job.title,
                description: job.description,
                budget: job.budget,
                location: job.location,
                type: job.type,
                experienceLevel: job.experienceLevel,
                category: job.category?.name,
                categoryId: job.categoryId,
                skills: job.skills.map((s: any) => s.skill.name),
                createdAt: job.createdAt,
                status: job.status
            };

            const response = await fetch(`${searchUrl}/search/jobs/index`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(indexedJob),
            });

            if (response.ok) {
                console.log(`Job ${job.id} indexed in search service`);
            } else {
                console.error(`Failed to index job ${job.id}: ${response.statusText}`);
            }
        } catch (error) {
            console.error(`Error syncing job ${job.id} to search:`, error.message);
        }
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
