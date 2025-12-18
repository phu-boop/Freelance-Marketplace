import { Controller, Post, UploadedFile, UseInterceptors, Get, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service';

@Controller('storage')
export class StorageController {
    constructor(private readonly minioService: MinioService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        const fileName = await this.minioService.uploadFile(file);
        return { fileName };
    }

    @Get('url/:fileName')
    async getFileUrl(@Param('fileName') fileName: string) {
        const url = await this.minioService.getFileUrl(fileName);
        return { url };
    }
}
