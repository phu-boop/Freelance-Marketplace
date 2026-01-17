import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service';

@Controller('api/storage')
export class StorageController {
    constructor(private readonly minioService: MinioService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Mock Malware Scan (ClamAV Integration placeholder)
        // For demonstration, we'll flag any file with 'EICAR' in its content as a virus
        const content = file.buffer.toString();
        if (content.includes('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*')) {
            throw new BadRequestException('Security Alert: Malware detected in uploaded file.');
        }

        const fileName = await this.minioService.uploadFile(file);
        return { fileName };
    }

    @Get('url/:fileName')
    async getFileUrl(@Param('fileName') fileName: string) {
        const url = await this.minioService.getFileUrl(fileName);
        return { url };
    }
}
