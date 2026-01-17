import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding beautiful review data...');

    const reviews = [
        {
            reviewer_id: '901f6a31-3e22-4cb9-8dbb-2ad1b3a42040', // Sarah Horizon
            reviewee_id: '801f6a31-3e22-4cb9-8dbb-2ad1b3a42039', // Alex Rivera
            job_id: 'fake-job-1',
            contract_id: 'fake-contract-1',
            ratingOverall: 5,
            ratingCommunication: 5,
            ratingQuality: 5,
            ratingValue: 5,
            ratingSchedule: 5,
            comment: 'Alex is an absolute professional. His deep understanding of Kubernetes saved our project weeks of frustration. Highly recommended!',
            status: 'RELEASED',
        },
        {
            reviewer_id: '301f6a31-3e22-4cb9-8dbb-2ad1b3a42034', // David Chen
            reviewee_id: '801f6a31-3e22-4cb9-8dbb-2ad1b3a42039', // Alex Rivera
            job_id: 'fake-job-2',
            contract_id: 'fake-contract-2',
            ratingOverall: 5,
            ratingCommunication: 4,
            ratingQuality: 5,
            ratingValue: 5,
            ratingSchedule: 5,
            comment: 'Great work on our AWS migration. Expert level skills.',
            status: 'RELEASED',
        },
        {
            reviewer_id: '901f6a31-3e22-4cb9-8dbb-2ad1b3a42040', // Sarah Horizon
            reviewee_id: '701f6a31-3e22-4cb9-8dbb-2ad1b3a42038', // Sarah Chen
            job_id: 'fake-job-3',
            contract_id: 'fake-contract-3',
            ratingOverall: 5,
            ratingCommunication: 5,
            ratingQuality: 5,
            ratingValue: 4,
            ratingSchedule: 5,
            comment: 'Sarah is an incredible designer. She perfectly captured our brand essence and translated it into a beautiful dashboard.',
            status: 'RELEASED',
        },
        {
            reviewer_id: '201f6a31-3e22-4cb9-8dbb-2ad1b3a42033', // Michael Scott
            reviewee_id: '501f6a31-3e22-4cb9-8dbb-2ad1b3a42036', // Elena Petrova
            job_id: 'fake-job-4',
            contract_id: 'fake-contract-4',
            ratingOverall: 5,
            ratingCommunication: 5,
            ratingQuality: 5,
            ratingValue: 5,
            ratingSchedule: 5,
            comment: 'The data insights Elena provided were game-changing for our logistics planning. True expert.',
            status: 'RELEASED',
        }
    ];

    for (const r of reviews) {
        await prisma.review.create({
            data: r as any
        });
    }

    console.log(`Seeded ${reviews.length} reviews!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
