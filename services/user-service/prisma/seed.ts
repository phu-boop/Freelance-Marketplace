import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding beautiful user data...');

    const users = [
        {
            id: '901f6a31-3e22-4cb9-8dbb-2ad1b3a42040', // Main Client
            email: 'client@horizon.com',
            firstName: 'Sarah',
            lastName: 'Horizon',
            roles: ['CLIENT'],
            companyName: 'Horizon Ventures',
            companySize: '11-50 employees',
            industry: 'Venture Capital',
            isPaymentVerified: true,
            isIdentityVerified: true,
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop',
            country: 'United States',
        },
        {
            id: '801f6a31-3e22-4cb9-8dbb-2ad1b3a42039', // Main Freelancer
            email: 'alex@cloud.dev',
            firstName: 'Alex',
            lastName: 'Rivera',
            roles: ['FREELANCER'],
            title: 'Senior Cloud Architect',
            overview: 'Expert in designing and implementing scalable cloud architectures. 10+ years of experience with AWS, Kubernetes, and Terraform. Helping startups scale to millions of users.',
            hourlyRate: 125,
            skills: ['AWS', 'Kubernetes', 'Terraform', 'Node.js', 'Go'],
            isAvailable: true,
            rating: 4.95,
            reviewCount: 124,
            jobSuccessScore: 100,
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
            country: 'Spain',
            completionPercentage: 100,
        },
        {
            id: '701f6a31-3e22-4cb9-8dbb-2ad1b3a42038',
            email: 'sarah@design.io',
            firstName: 'Sarah',
            lastName: 'Chen',
            roles: ['FREELANCER'],
            title: 'Lead Product Designer',
            overview: 'I transform complex problems into elegant, user-centric designs. Specializing in SaaS products and design systems.',
            hourlyRate: 95,
            skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Adobe XD'],
            isAvailable: true,
            rating: 4.88,
            reviewCount: 89,
            jobSuccessScore: 98,
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&auto=format&fit=crop',
            country: 'Canada',
            completionPercentage: 95,
        },
        {
            id: '601f6a31-3e22-4cb9-8dbb-2ad1b3a42037',
            email: 'marcus@thor.dev',
            firstName: 'Marcus',
            lastName: 'Thorne',
            roles: ['FREELANCER'],
            title: 'Full Stack Engineer (TypeScript/Go)',
            overview: 'A pragmatic developer focused on building reliable and performant web applications. Lead contributor to several open-source projects.',
            hourlyRate: 85,
            skills: ['Next.js', 'TypeScript', 'Go', 'PostgreSQL', 'Redis'],
            isAvailable: true,
            rating: 5.0,
            reviewCount: 42,
            jobSuccessScore: 100,
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop',
            country: 'Germany',
            completionPercentage: 100,
        },
        {
            id: '501f6a31-3e22-4cb9-8dbb-2ad1b3a42036',
            email: 'elena@data.ai',
            firstName: 'Elena',
            lastName: 'Petrova',
            roles: ['FREELANCER'],
            title: 'AI/ML Engineer & Data Scientist',
            overview: 'PhD in Computer Science with a focus on Deep Learning. Specialized in natural language processing and predictive analytics.',
            hourlyRate: 150,
            skills: ['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'Scikit-learn'],
            isAvailable: true,
            rating: 4.98,
            reviewCount: 65,
            jobSuccessScore: 100,
            avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&h=256&auto=format&fit=crop',
            country: 'Estonia',
            completionPercentage: 100,
        },
        {
            id: '401f6a31-3e22-4cb9-8dbb-2ad1b3a42035',
            email: 'james@words.biz',
            firstName: 'James',
            lastName: 'Wilson',
            roles: ['FREELANCER'],
            title: 'B2B Content Strategist & Copywriter',
            overview: 'Helping tech companies tell their story through high-converting copy and strategic content roadmaps.',
            hourlyRate: 75,
            skills: ['Content Strategy', 'Copywriting', 'SEO', 'Technical Writing'],
            isAvailable: true,
            rating: 4.75,
            reviewCount: 230,
            jobSuccessScore: 92,
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&h=256&auto=format&fit=crop',
            country: 'United Kingdom',
            completionPercentage: 80,
        },
        {
            id: '301f6a31-3e22-4cb9-8dbb-2ad1b3a42034',
            email: 'ceo@innovatex.com',
            firstName: 'David',
            lastName: 'Chen',
            roles: ['CLIENT'],
            companyName: 'InnovateX Solutions',
            companySize: '1-10 employees',
            industry: 'Software Development',
            isPaymentVerified: true,
            isIdentityVerified: true,
            avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&h=256&auto=format&fit=crop',
            country: 'Singapore',
        },
        {
            id: '201f6a31-3e22-4cb9-8dbb-2ad1b3a42033',
            email: 'hr@glcorp.com',
            firstName: 'Michael',
            lastName: 'Scott',
            roles: ['CLIENT'],
            companyName: 'Global Logistics Corp',
            companySize: '5001-10,000 employees',
            industry: 'Logistics & Supply Chain',
            isPaymentVerified: false,
            isIdentityVerified: true,
            avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&h=256&auto=format&fit=crop',
            country: 'United States',
        }
    ];

    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: u,
            create: u,
        });

        // Seed Experience for Alex
        if (u.firstName === 'Alex') {
            await prisma.experience.createMany({
                data: [
                    {
                        userId: u.id,
                        company: 'AWS (Amazon Web Services)',
                        title: 'Senior Solutions Architect',
                        startDate: new Date('2018-01-01'),
                        endDate: new Date('2022-01-01'),
                        description: 'Designed highly available systems for enterprise customers.',
                    },
                    {
                        userId: u.id,
                        company: 'CloudNative Inc.',
                        title: 'Kubernetes Engineer',
                        startDate: new Date('2015-06-01'),
                        endDate: new Date('2017-12-01'),
                        description: 'Early adopter and implementer of K8s clusters.',
                    }
                ]
            });

            await prisma.portfolioItem.createMany({
                data: [
                    {
                        userId: u.id,
                        title: 'Auto-Scaling Infrastructure for Fintech',
                        description: 'Reduced infrastructure costs by 40% while improving latency.',
                        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
                        skills: ['Terraform', 'AWS', 'RDS'],
                    }
                ]
            });
        }
    }

    console.log(`Seeded ${users.length} users with rich profiles!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
