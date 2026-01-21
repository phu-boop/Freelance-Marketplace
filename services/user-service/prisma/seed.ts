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

    // --- RANDOM DATA GENERATORS ---
    const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Daniel', 'Lisa', 'Matthew', 'Nancy', 'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra', 'Steven', 'Ashley', 'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna', 'Kenneth', 'Michelle', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon', 'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy', 'Nicholas', 'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen', 'Stephen', 'Anna', 'Larry', 'Brenda', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Emma', 'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Gregory', 'Christine', 'Frank', 'Debra', 'Alexander', 'Rachel', 'Raymond', 'Catherine', 'Patrick', 'Carolyn', 'Jack', 'Janet', 'Dennis', 'Ruth', 'Jerry', 'Maria', 'Tyler', 'Heather', 'Aaron', 'Diane'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];
    const titles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer', 'Content Writer', 'Digital Marketer', 'Project Manager', 'QA Engineer', 'Sales Representative', 'Customer Support Specialist', 'Graphic Designer', 'Video Editor', 'Copywriter', 'SEO Specialist', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer', 'AI Researcher'];
    const companies = ['TechCorp', 'InnovateX', 'GlobalSolutions', 'NextLevel', 'CloudNine', 'DataDriven', 'CreativeMinds', 'FutureTech', 'SmartSystems', 'WebWizards', 'AppMasters', 'DesignStudio', 'MarketingGurus', 'SalesForce', 'SupportHeroes', 'GreenEnergy', 'BlueOcean', 'RedRock', 'YellowSun', 'PurpleRain'];
    const skillsList = ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Go', 'Rust', 'TypeScript', 'Kotlin', 'Scala', 'R', 'MATLAB', 'HTML', 'CSS', 'SQL', 'NoSQL', 'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'Spring', 'ASP.NET', 'Laravel', 'Ruby on Rails', 'Express.js', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Tableau', 'Power BI'];
    const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Australia', 'Japan', 'China', 'India', 'Brazil', 'Spain', 'Italy', 'Russia', 'South Korea', 'Mexico', 'Indonesia', 'Netherlands', 'Saudi Arabia', 'Turkey', 'Switzerland'];

    function getRandomElement<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getRandomSubarray<T>(arr: T[], size: number): T[] {
        const shuffled = arr.slice(0);
        let i = arr.length;
        while (i--) {
            const index = Math.floor(Math.random() * (i + 1));
            const temp = shuffled[i];
            shuffled[i] = shuffled[index];
            shuffled[index] = temp;
        }
        return shuffled.slice(0, size);
    }

    const randomUsers = Array.from({ length: 50 }).map((_, i) => {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const role = Math.random() > 0.3 ? 'FREELANCER' : 'CLIENT';
        const isFreelancer = role === 'FREELANCER';

        return {
            id: `rad-u-${i + 100}`, // Predictable IDs for syncing
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
            firstName,
            lastName,
            roles: [role],
            title: isFreelancer ? getRandomElement(titles) : undefined,
            companyName: !isFreelancer ? getRandomElement(companies) : undefined,
            overview: isFreelancer ? `Experienced ${getRandomElement(titles)} with a passion for delivering high-quality results. Proven track record in the industry.` : undefined,
            hourlyRate: isFreelancer ? Math.floor(Math.random() * 150) + 20 : undefined,
            skills: isFreelancer ? getRandomSubarray(skillsList, Math.floor(Math.random() * 5) + 3) : [],
            isAvailable: true,
            rating: isFreelancer ? parseFloat((Math.random() * 2 + 3).toFixed(2)) : undefined,
            reviewCount: isFreelancer ? Math.floor(Math.random() * 50) : undefined,
            jobSuccessScore: isFreelancer ? Math.floor(Math.random() * 30) + 70 : undefined,
            // Use a diverse set of random user images
            avatarUrl: `https://i.pravatar.cc/150?u=${firstName}${lastName}${i}`,
            country: getRandomElement(countries),
            completionPercentage: isFreelancer ? Math.floor(Math.random() * 40) + 60 : undefined,
        };
    });

    const allUsers = [...users, ...randomUsers];

    console.log(`Seeding ${allUsers.length} users...`);

    for (const u of allUsers) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: u,
            create: u,
        });

        // Add some random experience/education for freelancers
        if (u.roles.includes('FREELANCER') && u.id.startsWith('rad-u')) {
            // 50% chance to have experience
            if (Math.random() > 0.5) {
                await prisma.experience.create({
                    data: {
                        userId: u.id,
                        company: getRandomElement(companies),
                        title: u.title || 'Developer',
                        startDate: new Date('2020-01-01'),
                        endDate: new Date('2022-01-01'),
                        description: 'Worked on key projects and lead a team of 5.'
                    }
                });
            }
        }
    }

    console.log(`Seeded ${allUsers.length} users with rich profiles!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
