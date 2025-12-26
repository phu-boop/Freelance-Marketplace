import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';

interface SampleData {
    education: any[];
    experience: any[];
    portfolio: any[];
}

const sampleData: SampleData = {
    education: [
        {
            institution: 'University of Example',
            degree: 'B.Sc Computer Science',
            fieldOfStudy: 'Computer Science',
            startDate: new Date('2015-09-01'),
            endDate: new Date('2019-06-01'),
        },
    ],
    experience: [
        {
            company: 'Acme Corp',
            title: 'Junior Developer',
            location: 'Remote',
            startDate: new Date('2019-07-01'),
            endDate: new Date('2021-12-31'),
            description: 'Worked on web applications',
        },
    ],
    portfolio: [
        {
            title: 'Awesome Project',
            description: 'A cool project I built',
            imageUrl: 'https://via.placeholder.com/150',
            projectUrl: 'https://example.com',
            skills: ['React', 'Node.js'],
        },
    ],
};

async function createUser(
    usersService: UsersService,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string,
) {
    const user = await usersService.register({
        email,
        password,
        firstName,
        lastName,
        roles: [role],
    });
    const userId = user.id;
    // Seed related data
    for (const edu of sampleData.education) {
        await usersService.addEducation(userId, { ...edu, userId });
    }
    for (const exp of sampleData.experience) {
        await usersService.addExperience(userId, { ...exp, userId });
    }
    for (const port of sampleData.portfolio) {
        await usersService.addPortfolio(userId, { ...port, userId });
    }
    console.log(`Created user ${email} with role ${role}`);
}

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);

    await createUser(
        usersService,
        'freelancer@example.com',
        'Password123!',
        'Freelance',
        'User',
        'FREELANCER',
    );
    await createUser(
        usersService,
        'client@example.com',
        'Password123!',
        'Client',
        'User',
        'CLIENT',
    );
    await createUser(
        usersService,
        'admin@example.com',
        'Password123!',
        'Admin',
        'User',
        'ADMIN',
    );

    await app.close();
}

bootstrap().catch((err) => {
    console.error('Error creating test accounts:', err);
    process.exit(1);
});
