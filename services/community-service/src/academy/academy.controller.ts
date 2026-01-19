import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { AcademyService } from './academy.service';
import { CreateCourseDto, CreateLessonDto } from './academy.dto';
import { Public, Roles } from 'nest-keycloak-connect';

@Controller('api/academy')
export class AcademyController {
    constructor(private readonly academyService: AcademyService) { }

    @Post('courses')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    createCourse(@Body() dto: CreateCourseDto) {
        return this.academyService.createCourse(dto);
    }

    @Post('courses/:id/lessons')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    addLesson(@Param('id') id: string, @Body() dto: CreateLessonDto) {
        return this.academyService.addLesson(id, dto);
    }

    @Public()
    @Get('courses')
    getCourses() {
        return this.academyService.getCourses();
    }

    @Public()
    @Get('courses/:id')
    getCourse(@Param('id') id: string) {
        return this.academyService.getCourse(id);
    }

    @Post('courses/:id/complete')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
    completeCourse(@Request() req, @Param('id') id: string) {
        return this.academyService.completeCourse(req.user.sub, id);
    }

    @Get('my-certifications')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
    getMyCertifications(@Request() req) {
        return this.academyService.getMyCertifications(req.user.sub);
    }
}
