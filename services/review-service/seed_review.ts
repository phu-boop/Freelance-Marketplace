import { PrismaClient } from '@prisma/client';

async function seed() {
    const prisma = new PrismaClient();

    console.log('--- Seeding Test Review ---');

    try {
        const review = await prisma.review.create({
            data: {
                id: 'review-f063-test',
                reviewer_id: '381d338b-59ed-4cb9-a61b-67a88b9d80e0', // KHTEST@gmail.com
                reviewee_id: '44b42ab2-dd30-4c94-8ed1-6dfe1d3cca7d', // Free@gmail.com
                job_id: 'job-f063',
                contract_id: 'contract-f063',
                ratingOverall: 5,
                ratingCommunication: 5,
                ratingQuality: 5,
                ratingValue: 5,
                ratingSchedule: 5,
                comment: 'Fantastic work! Highly professional and timely.',
            }
        });
        console.log('✅ Test review created:', review.id);
    } catch (error) {
        console.error('❌ Failed to seed review:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
