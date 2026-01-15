
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);

    try {
        console.log('Creating admin user...');
        await usersService.register({
            email: 'admin_test@example.com',
            password: '123123',
            firstName: 'Super',
            lastName: 'Admin',
            roles: ['ADMIN'],
        });
        console.log('Admin user created successfully: admin_test@example.com / 123123');
    } catch (error) {
        console.error('Failed to create admin user:', error.message);
    }

    await app.close();
}

bootstrap();
