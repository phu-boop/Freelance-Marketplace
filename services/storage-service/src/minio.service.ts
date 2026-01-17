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

        // Set public read policy
        const policy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Principal: { AWS: ['*'] },
                    Action: ['s3:GetBucketLocation', 's3:ListBucket'],
                    Resource: [`arn:aws:s3:::${this.bucketName}`],
                },
                {
                    Effect: 'Allow',
                    Principal: { AWS: ['*'] },
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${this.bucketName}/*`],
                },
            ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        console.log(`Public read policy applied to bucket ${this.bucketName}`);
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
        const externalUrl = this.configService.get('MINIO_EXTERNAL_URL');
        if (externalUrl) {
            // Since we set the bucket to public-read, we can use a direct URL.
            // This avoids signature mismatch issues when switching between internal/external hostnames.
            return `${externalUrl}/${this.bucketName}/${fileName}`;
        }

        // Fallback to presigned URL if no external URL is configured
        return await this.minioClient.presignedGetObject(this.bucketName, fileName);
    }
}
