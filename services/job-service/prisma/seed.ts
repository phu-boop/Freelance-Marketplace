import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function main() {
    console.log('Start seeding beautiful job and proposal data...');

    // 1. Categories
    const categoriesSeed = [
        { name: 'Web, Mobile & Software Dev', parentId: null },
        { name: 'Design & Creative', parentId: null },
        { name: 'Data Science & Analytics', parentId: null },
        { name: 'Writing & Translation', parentId: null },
        { name: 'Sales & Marketing', parentId: null },
    ];

    for (const cat of categoriesSeed) {
        await prisma.category.upsert({
            where: { name: cat.name },
            update: {},
            create: { name: cat.name, slug: slugify(cat.name) }
        });
    }

    const devParent = await prisma.category.findUnique({ where: { name: 'Web, Mobile & Software Dev' } });
    const designParent = await prisma.category.findUnique({ where: { name: 'Design & Creative' } });
    const dataParent = await prisma.category.findUnique({ where: { name: 'Data Science & Analytics' } });

    if (devParent) {
        const subs = ['E-commerce Development', 'Frontend Development', 'Backend Development', 'Mobile App Development', 'Full Stack Development', 'DevOps & Systems'];
        for (const sub of subs) {
            await prisma.category.upsert({
                where: { name: sub },
                update: {},
                create: { name: sub, slug: slugify(sub), parentId: devParent.id }
            });
        }
    }

    if (designParent) {
        const subs = ['UI/UX Design', 'Brand Identity', 'Illustration', 'Video Production', 'Graphic Design'];
        for (const sub of subs) {
            await prisma.category.upsert({
                where: { name: sub },
                update: {},
                create: { name: sub, slug: slugify(sub), parentId: designParent.id }
            });
        }
    }

    if (dataParent) {
        const subs = ['Machine Learning', 'Data Visualization', 'Big Data Engineering', 'Statistical Analysis'];
        for (const sub of subs) {
            await prisma.category.upsert({
                where: { name: sub },
                update: {},
                create: { name: sub, slug: slugify(sub), parentId: dataParent.id }
            });
        }
    }

    console.log('Categories seeded!');

    // 2. Skills
    const skills = [
        'React', 'Node.js', 'Next.js', 'Go', 'AWS', 'Kubernetes', 'Terraform', 'PostgreSQL', 'Redis',
        'Figma', 'UI/UX Design', 'Design Systems', 'Adobe Creative Suite',
        'Python', 'PyTorch', 'TensorFlow', 'MLOps', 'Scikit-learn',
        'Content Strategy', 'SEO', 'Technical Writing', 'Copywriting', 'TypeScript'
    ];

    const skillMap: Record<string, string> = {};
    for (const sName of skills) {
        const s = await prisma.skill.upsert({
            where: { name: sName },
            update: {},
            create: { name: sName }
        });
        skillMap[sName] = s.id;
    }
    console.log('Skills seeded!');

    // 3. Jobs
    const clientId = '901f6a31-3e22-4cb9-8dbb-2ad1b3a42040'; // Sarah Horizon
    const catDevOps = await prisma.category.findUnique({ where: { name: 'DevOps & Systems' } });
    const catUIUX = await prisma.category.findUnique({ where: { name: 'UI/UX Design' } });
    const catML = await prisma.category.findUnique({ where: { name: 'Machine Learning' } });
    const catFullStack = await prisma.category.findUnique({ where: { name: 'Full Stack Development' } });

    const jobs = [
        {
            title: 'Build a Scalable Microservices Architecture for Fintech',
            description: 'We are looking for an expert Cloud Architect to design and implement a multi-region, auto-scaling Kubernetes infrastructure. Must have experience with high-traffic fintech systems.',
            budget: 12000,
            type: 'FIXED_PRICE',
            experienceLevel: 'EXPERT',
            locationType: 'REMOTE',
            categoryId: catDevOps?.id,
            status: 'OPEN',
            duration: '3 months',
            tags: ['AWS', 'Kubernetes', 'Terraform']
        },
        {
            title: 'Lead Designer for SaaS Product Redesign',
            description: 'Total overhaul of our B2B SaaS dashboard. We need a design visionary who understands design systems and advanced user workflows.',
            budget: 8500,
            type: 'FIXED_PRICE',
            experienceLevel: 'EXPERT',
            locationType: 'REMOTE',
            categoryId: catUIUX?.id,
            status: 'OPEN',
            duration: '2 months',
            tags: ['Figma', 'UI/UX Design', 'Design Systems']
        },
        {
            title: 'AI Data Pipeline for E-commerce Recommendations',
            description: 'Build an end-to-end ML pipeline to process millions of user events and serve real-time product recommendations. Python and PyTorch preferred.',
            budget: 150,
            type: 'HOURLY',
            experienceLevel: 'EXPERT',
            locationType: 'REMOTE',
            categoryId: catML?.id,
            status: 'IN_PROGRESS',
            duration: 'Ongoing',
            tags: ['Python', 'PyTorch', 'MLOps']
        },
        {
            title: 'Full Stack Next.js Developer for Web3 Marketplace',
            description: 'Help us build a premium marketplace for high-end digital assets. Focus on performance and security.',
            budget: 5000,
            type: 'FIXED_PRICE',
            experienceLevel: 'INTERMEDIATE',
            locationType: 'REMOTE',
            categoryId: catFullStack?.id,
            status: 'OPEN',
            duration: '1 month',
            tags: ['Next.js', 'TypeScript', 'PostgreSQL']
        }
    ];

    const searchUrl = process.env.SEARCH_SERVICE_URL || 'http://search-service:3010';

    for (const jSeed of jobs) {
        const { tags, ...jData } = jSeed;
        const job = await prisma.job.create({
            data: {
                ...jData,
                client_id: clientId,
                skills: {
                    create: tags.filter(t => skillMap[t]).map(t => ({
                        skill: { connect: { id: skillMap[t] } }
                    }))
                }
            },
            include: { category: true, skills: { include: { skill: true } } }
        });

        console.log(`Job Created: ${job.title}`);

        // Sync to search
        try {
            await fetch(`${searchUrl}/api/search/jobs/index`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
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
                }),
            });
        } catch (e) { }

        // 4. Proposals
        if (job.title.includes('Microservices')) {
            // Alex applies
            await prisma.proposal.create({
                data: {
                    jobId: job.id,
                    freelancerId: '801f6a31-3e22-4cb9-8dbb-2ad1b3a42039',
                    bidAmount: 11500,
                    timeline: '10 weeks',
                    status: 'NEGOTIATION',
                    coverLetter: 'I have built similar systems for 3 Fortune 500 companies. My approach uses blue-green deployments with zero downtime.'
                }
            });
        }

        if (job.title.includes('Design')) {
            // Sarah applies
            await prisma.proposal.create({
                data: {
                    jobId: job.id,
                    freelancerId: '701f6a31-3e22-4cb9-8dbb-2ad1b3a42038',
                    bidAmount: 8500,
                    timeline: '8 weeks',
                    status: 'OFFERED',
                    coverLetter: 'I love your companies vision. I have several design systems in my portfolio that align well with what you are looking for.'
                }
            });
        }

        if (job.title.includes('AI Data Pipeline')) {
            // Elena is hired
            const proposal = await prisma.proposal.create({
                data: {
                    jobId: job.id,
                    freelancerId: '501f6a31-3e22-4cb9-8dbb-2ad1b3a42036',
                    bidAmount: 150,
                    timeline: 'Ongoing',
                    status: 'HIRED',
                    coverLetter: 'I specialize in real-time recommendation engines. I can implement this using a Lambda architecture on AWS.'
                }
            });

            // Add some milestones
            await prisma.milestone.create({
                data: {
                    proposalId: proposal.id,
                    description: 'Architecture Design and Data Modeling',
                    amount: 3000,
                    status: 'PAID',
                    dueDate: new Date()
                }
            });

            await prisma.milestone.create({
                data: {
                    proposalId: proposal.id,
                    description: 'Pipeline Implementation (Phase 1)',
                    amount: 5000,
                    status: 'SUBMITTED',
                    dueDate: new Date(Date.now() + 86400000 * 7)
                }
            });
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
