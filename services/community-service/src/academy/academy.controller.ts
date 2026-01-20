import { Controller, Get, Post, Param, Request, UseGuards } from '@nestjs/common';
import { AcademyService } from './academy.service';
// import { AuthGuard } from '../common/auth.guard'; // Assuming AuthGuard exists

@Controller('academy')
export class AcademyController {
    constructor(private readonly academyService: AcademyService) { }

    @Get('courses')
    async listCourses() {
        return this.academyService.listCourses();
    }

    @Get('courses/:id')
    async getCourse(@Param('id') id: string) {
        return this.academyService.getCourse(id);
    }

    @Post('courses/:id/enroll')
    // @UseGuards(AuthGuard)
    async enroll(@Param('id') id: string, @Request() req: any) {
        const userId = req.user?.id || 'mock-user-id'; // Fallback for dev
        return this.academyService.enroll(userId, id);
    }

    @Get('certifications/my')
    // @UseGuards(AuthGuard)
    async getMyCertifications(@Request() req: any) {
        const userId = req.user?.sub || req.user?.id || 'mock-user-id';
        return this.academyService.getMyCertifications(userId);
    }

    @Post('courses/:id/complete')
    // @UseGuards(AuthGuard)
    async complete(@Param('id') id: string, @Request() req: any) {
        const userId = req.user?.id || 'mock-user-id'; // Fallback for dev
        return this.academyService.completeCourse(userId, id);
    }
}
