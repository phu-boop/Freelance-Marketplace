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

    // --- SYNC USERS & GENERATE RANDOM DATA ---
    const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Daniel', 'Lisa', 'Matthew', 'Nancy', 'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra', 'Steven', 'Ashley', 'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna', 'Kenneth', 'Michelle', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon', 'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy', 'Nicholas', 'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen', 'Stephen', 'Anna', 'Larry', 'Brenda', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Emma', 'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Gregory', 'Christine', 'Frank', 'Debra', 'Alexander', 'Rachel', 'Raymond', 'Catherine', 'Patrick', 'Carolyn', 'Jack', 'Janet', 'Dennis', 'Ruth', 'Jerry', 'Maria', 'Tyler', 'Heather', 'Aaron', 'Diane'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];
    const titles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer', 'Content Writer', 'Digital Marketer', 'Project Manager', 'QA Engineer', 'Sales Representative', 'Customer Support Specialist', 'Graphic Designer', 'Video Editor', 'Copywriter', 'SEO Specialist', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer', 'AI Researcher'];
    const jobTitles = ['Need a website built', 'Fix my React App', 'Logo Design needed', 'SEO Optimization', 'Write blog posts', 'Data Entry task', 'Mobile App MVP', 'Python automation script', 'Shopify Store setup', 'Video editing for YouTube', 'Virtual Assistant needed', 'Marketing strategy consultation', 'Legal consulting', 'Accounting help', 'Translation English to Spanish', 'Voice over artist', 'Illustration for book', '3D Modeling for game', 'Music production', 'Cybersecurity audit'];

    function getRandomElement<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // static users from user-service/prisma/seed.ts
    const staticUsers = [
        { id: '901f6a31-3e22-4cb9-8dbb-2ad1b3a42040', email: 'client@horizon.com', firstName: 'Sarah', lastName: 'Horizon', roles: ['CLIENT'] },
        { id: '801f6a31-3e22-4cb9-8dbb-2ad1b3a42039', email: 'alex@cloud.dev', firstName: 'Alex', lastName: 'Rivera', roles: ['FREELANCER'] },
        { id: '701f6a31-3e22-4cb9-8dbb-2ad1b3a42038', email: 'sarah@design.io', firstName: 'Sarah', lastName: 'Chen', roles: ['FREELANCER'] },
        { id: '501f6a31-3e22-4cb9-8dbb-2ad1b3a42036', email: 'elena@data.ai', firstName: 'Elena', lastName: 'Petrova', roles: ['FREELANCER'] }
    ];

    // Reconstruct the 50 random users to match IDs
    const randomUsers = Array.from({ length: 50 }).map((_, i) => {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const role = Math.random() > 0.3 ? 'FREELANCER' : 'CLIENT';
        return {
            id: `rad-u-${i + 100}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
            firstName,
            lastName,
            roles: [role]
        };
    });

    const allUsers = [...staticUsers, ...randomUsers];

    // Uplift Users to Job Service (Sync Simulation)
    for (const u of allUsers) {
        await prisma.user.upsert({
            where: { id: u.id }, // Job service User table might key by ID or email
            update: {
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                roles: u.roles
            },
            create: {
                id: u.id,
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                roles: u.roles
            }
        });
    }
    console.log(`Synced ${allUsers.length} users to Job Service.`);

    // Generate Random Jobs
    const clients = allUsers.filter(u => u.roles.includes('CLIENT'));
    const freelancers = allUsers.filter(u => u.roles.includes('FREELANCER'));
    const cats = await prisma.category.findMany();

    for (let i = 0; i < 30; i++) {
        const client = getRandomElement(clients);
        const cat = getRandomElement(cats);

        const job = await prisma.job.create({
            data: {
                title: `${getRandomElement(jobTitles)} - ${i}`,
                description: `We are looking for a skilled professional to help with ${cat.name}. This is a critical project with a tight deadline.`,
                budget: Math.floor(Math.random() * 5000) + 100,
                type: Math.random() > 0.5 ? 'FIXED_PRICE' : 'HOURLY',
                experienceLevel: Math.random() > 0.6 ? 'EXPERT' : 'INTERMEDIATE',
                locationType: 'REMOTE',
                categoryId: cat.id,
                status: 'OPEN',
                client_id: client.id,
                updatedAt: new Date(),
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)) // Random past date
            }
        });

        // Sync to search (Mock)
        // ... (Skipping actual HTTP call to search to speed up seeding, or keep if critical)

        // Generate Proposals
        const numProposals = Math.floor(Math.random() * 5); // 0-4 proposals per job
        for (let j = 0; j < numProposals; j++) {
            const freelancer = getRandomElement(freelancers);
            // Verify unique proposal
            const exists = await prisma.proposal.findFirst({ where: { jobId: job.id, freelancerId: freelancer.id } });
            if (!exists) {
                await prisma.proposal.create({
                    data: {
                        jobId: job.id,
                        freelancerId: freelancer.id,
                        bidAmount: job.budget ? Number(job.budget) * (0.8 + Math.random() * 0.4) : 50, // +/- 20%
                        coverLetter: `I am the perfect fit for this job because I have extensive experience in ${cat.name}.`,
                        status: 'PENDING',
                        aiScore: Math.floor(Math.random() * 40) + 60, // Mock AI Score
                        createdAt: new Date()
                    }
                });
            }
        }
    }

    console.log('Seeding completed successfully with random data!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
