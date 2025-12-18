import { MinioService } from './minio.service';
export declare class StorageController {
    private readonly minioService;
    constructor(minioService: MinioService);
    uploadFile(file: Express.Multer.File): Promise<{
        fileName: string;
    }>;
    getFileUrl(fileName: string): Promise<{
        url: string;
    }>;
}
