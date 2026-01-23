import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Wallets for Users...');

    const staticUserIds = [
        '901f6a31-3e22-4cb9-8dbb-2ad1b3a42040', // Client Sarah
        '801f6a31-3e22-4cb9-8dbb-2ad1b3a42039', // Freelancer Alex
        '701f6a31-3e22-4cb9-8dbb-2ad1b3a42038', // Freelancer Sarah
        '601f6a31-3e22-4cb9-8dbb-2ad1b3a42037', // Freelancer Marcus
        '501f6a31-3e22-4cb9-8dbb-2ad1b3a42036', // Freelancer Elena
        '401f6a31-3e22-4cb9-8dbb-2ad1b3a42035', // Freelancer James
        '301f6a31-3e22-4cb9-8dbb-2ad1b3a42034', // Client David
        '201f6a31-3e22-4cb9-8dbb-2ad1b3a42033', // Client Michael
    ];

    const randomUserIds = Array.from({ length: 50 }).map((_, i) => `rad-u-${i + 100}`);
    const allUserIds = [...staticUserIds, ...randomUserIds];

    for (const userId of allUserIds) {
        // Create wallet if not exists
        await prisma.wallet.upsert({
            where: { userId },
            update: {
                connectsBalance: 100, // Ensure they have connects
                balance: 1000,       // Ensure they have money
            },
            create: {
                userId,
                balance: 1000,
                connectsBalance: 100, // Initial connects for new users
                currency: 'USD',
                autoWithdrawalEnabled: false,
                pendingBalance: 0
            }
        });
    }

    console.log(`Seeded wallets for ${allUserIds.length} users.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
