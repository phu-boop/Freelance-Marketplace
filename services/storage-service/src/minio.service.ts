import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
    private minioClient: Minio.Client;
    private bucketName = 'freelance-uploads';

    constructor(private configService: ConfigService) {
        this.minioClient = new Minio.Client({
            endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost'),
            port: parseInt(this.configService.get('MINIO_PORT', '9000')),
            useSSL: false,
            accessKey: this.configService.get('MINIO_ACCESS_KEY', 'admin'),
            secretKey: this.configService.get('MINIO_SECRET_KEY', 'password'),
        });
    }

    async onModuleInit() {
        await this.createBucketIfNotExists();
    }

    async createBucketIfNotExists() {
        const exists = await this.minioClient.bucketExists(this.bucketName);
        if (!exists) {
            await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
            console.log(`Bucket ${this.bucketName} created.`);
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const fileName = `${Date.now()}-${file.originalname}`;
        await this.minioClient.putObject(
            this.bucketName,
            fileName,
            file.buffer,
            file.size,
        );
        return fileName;
    }

    async getFileUrl(fileName: string): Promise<string> {
        return await this.minioClient.presignedGetObject(this.bucketName, fileName);
    }
}
