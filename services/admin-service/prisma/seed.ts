import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding beautiful admin data...');

    // 1. System Configs
    const configs = [
        { key: 'PLATFORM_FEE_PERCENT', value: '10' },
        { key: 'MINIMUM_WITHDRAWAL', value: '50' },
        { key: 'KYC_REQUIRED', value: 'true' },
        { key: 'WITHDRAWAL_REVIEW_THRESHOLD', value: '1000' }
    ];

    for (const c of configs) {
        await prisma.systemConfig.upsert({
            where: { key: c.key },
            update: { value: c.value },
            create: { key: c.key, value: c.value }
        });
    }

    // 2. Support Tickets
    const tickets = [
        {
            userId: '801f6a31-3e22-4cb9-8dbb-2ad1b3a42039', // Alex
            subject: 'Withdrawal Delay',
            message: 'My recent withdrawal has been pending for 48 hours. Can you check?',
            category: 'BILLING',
            priority: 'HIGH',
            status: 'OPEN'
        },
        {
            userId: '901f6a31-3e22-4cb9-8dbb-2ad1b3a42040', // Sarah H
            subject: 'How to invite multiple freelancers?',
            message: 'I want to invite 5 freelancers to my job at once. Is there a bulk option?',
            category: 'TECHNICAL',
            priority: 'NORMAL',
            status: 'IN_PROGRESS'
        }
    ];

    for (const t of tickets) {
        await prisma.supportTicket.create({ data: t });
    }

    // 3. Static Pages
    const pages = [
        {
            key: 'terms-of-service',
            title: 'Terms of Service',
            content: '<h1>Terms of Service</h1><p>Welcome to our platform...</p>',
            isPublished: true
        },
        {
            key: 'privacy-policy',
            title: 'Privacy Policy',
            content: '<h1>Privacy Policy</h1><p>We value your privacy...</p>',
            isPublished: true
        }
    ];

    for (const p of pages) {
        await prisma.staticPage.upsert({
            where: { key: p.key },
            update: p,
            create: p
        });
    }

    console.log('Admin seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
