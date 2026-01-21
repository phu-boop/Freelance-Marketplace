"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding Wallets for Users...');
    const staticUserIds = [
        '901f6a31-3e22-4cb9-8dbb-2ad1b3a42040',
        '801f6a31-3e22-4cb9-8dbb-2ad1b3a42039',
        '701f6a31-3e22-4cb9-8dbb-2ad1b3a42038',
        '601f6a31-3e22-4cb9-8dbb-2ad1b3a42037',
        '501f6a31-3e22-4cb9-8dbb-2ad1b3a42036',
        '401f6a31-3e22-4cb9-8dbb-2ad1b3a42035',
        '301f6a31-3e22-4cb9-8dbb-2ad1b3a42034',
        '201f6a31-3e22-4cb9-8dbb-2ad1b3a42033',
    ];
    const randomUserIds = Array.from({ length: 50 }).map((_, i) => `rad-u-${i + 100}`);
    const allUserIds = [...staticUserIds, ...randomUserIds];
    for (const userId of allUserIds) {
        await prisma.wallet.upsert({
            where: { userId },
            update: {
                connectsBalance: 100,
                balance: 1000,
            },
            create: {
                userId,
                balance: 1000,
                connectsBalance: 100,
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
//# sourceMappingURL=seed.js.map