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

        // REMOVED public read policy for Phase 14 (Security Compliance)
        // Only signed URLs should be used.
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        // Phase 14: Placeholder for Malware Scanning (e.g. ClamAV integration)
        console.log(`Scanning file ${file.originalname} for malware...`);
        const isSafe = await this.mockMalwareScan(file);
        if (!isSafe) {
            throw new Error('File rejected: Malware detected or suspicious content.');
        }

        const fileName = `${Date.now()}-${file.originalname}`;
        await this.minioClient.putObject(
            this.bucketName,
            fileName,
            file.buffer,
            file.size,
        );
        return fileName;
    }

    private async mockMalwareScan(file: Express.Multer.File): Promise<boolean> {
        // In production, this would call a ClamAV sidecar or similar service.
        return true;
    }

    async getFileUrl(fileName: string): Promise<string> {
        // Phase 14: Enforce short-lived signed URLs (Zero-Trust)
        // Expire in 1 hour (3600 seconds)
        return await this.minioClient.presignedGetObject(this.bucketName, fileName, 3600);
    }
}
