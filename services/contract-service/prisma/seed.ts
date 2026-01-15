import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding beautiful contract data...');

    const contracts = [
        {
            id: 'c01f6a31-3e22-4cb9-8dbb-2ad1b3a42031',
            job_id: 'fake-job-infra',
            freelancer_id: '801f6a31-3e22-4cb9-8dbb-2ad1b3a42039', // Alex Rivera
            client_id: '901f6a31-3e22-4cb9-8dbb-2ad1b3a42040',     // Sarah Horizon
            proposal_id: 'p01f6a31-3e22-4cb9-8dbb-2ad1b3a42031',
            totalAmount: 11500,
            status: 'ACTIVE',
            escrowStatus: 'FUNDED',
            escrowAmount: 11500,
            startDate: new Date(),
        },
        {
            id: 'c02f6a31-3e22-4cb9-8dbb-2ad1b3a42032',
            job_id: 'fake-job-design',
            freelancer_id: '701f6a31-3e22-4cb9-8dbb-2ad1b3a42038', // Sarah Chen
            client_id: '901f6a31-3e22-4cb9-8dbb-2ad1b3a42040',     // Sarah Horizon
            proposal_id: 'p02f6a31-3e22-4cb9-8dbb-2ad1b3a42032',
            totalAmount: 8500,
            status: 'COMPLETED',
            escrowStatus: 'RELEASED',
            escrowAmount: 0,
            startDate: new Date(Date.now() - 86400000 * 30),
            endDate: new Date(),
        }
    ];

    for (const c of contracts) {
        const { id, ...data } = c;
        await prisma.contract.upsert({
            where: { id },
            update: data as any,
            create: { id, ...data } as any,
        });

        if (c.id === 'c01f6a31-3e22-4cb9-8dbb-2ad1b3a42031') {
            await prisma.milestone.createMany({
                data: [
                    {
                        contractId: c.id,
                        description: 'Architecture Plan',
                        amount: 2500,
                        status: 'COMPLETED',
                        escrowStatus: 'RELEASED'
                    },
                    {
                        contractId: c.id,
                        description: 'Terraform Modules Implementation',
                        amount: 4500,
                        status: 'ACTIVE',
                        escrowStatus: 'FUNDED'
                    },
                    {
                        contractId: c.id,
                        description: 'Cluster Migration',
                        amount: 4500,
                        status: 'PENDING',
                        escrowStatus: 'FUNDED'
                    }
                ]
            });
        }
    }

    console.log(`Seeded ${contracts.length} contracts!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
