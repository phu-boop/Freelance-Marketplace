import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const categories = [
        { name: 'General Discussion', slug: 'general', description: 'Everything related to the marketplace' },
        { name: 'Freelancer Tips', slug: 'freelancer-tips', description: 'Share your knowledge and tips for success' },
        { name: 'Client Advice', slug: 'client-advice', description: 'Help for clients on how to find the best talent' },
        { name: 'Technical Support', slug: 'tech-support', description: 'Get help with platform-related technical issues' },
        { name: 'Showcase', slug: 'showcase', description: 'Show off your completed projects' },
    ];

    for (const cat of categories) {
        await prisma.forumCategory.upsert({
            where: { name: cat.name },
            update: {},
            create: cat,
        });
    }

    console.log('Seeded forum categories successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
