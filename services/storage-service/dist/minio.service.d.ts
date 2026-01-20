import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MinioService implements OnModuleInit {
    private configService;
    private minioClient;
    private bucketName;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    createBucketIfNotExists(): Promise<void>;
    uploadFile(file: Express.Multer.File): Promise<string>;
    private mockMalwareScan;
    getFileUrl(fileName: string): Promise<string>;
}
