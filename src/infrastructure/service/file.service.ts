import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import env from '@/shared/env';

export class FileService {
    private s3Client: S3Client;
    private readonly bucketName: string;
    private readonly filesPrefix = 'files';

    constructor() {
        this.bucketName = env.AWS_S3_BUCKET;
        this.s3Client = new S3Client({
            region: env.AWS_REGION,
            credentials: {
                accessKeyId: env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }

    /**
     * Save a file buffer to S3 with original filename
     * @param buffer - File buffer
     * @param fileName - Original filename
     * @param companyRuc - RUC of the company
     * @returns S3 object key
     */
    async saveFile(
        buffer: Buffer,
        fileName: string,
        companyRuc: string
    ): Promise<string> {
        try {
            // Generate S3 key: files/RUC/YEAR/FILENAME
            const year = new Date().getFullYear();
            const s3Key = `${this.filesPrefix}/${companyRuc}/${year}/${fileName}`;

            // Upload to S3
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: s3Key,
                Body: buffer,
                ContentType: 'application/octet-stream',
                ServerSideEncryption: 'AES256',
                Metadata: {
                    'original-filename': fileName,
                    'company-ruc': companyRuc,
                    'upload-date': new Date().toISOString(),
                },
            });

            await this.s3Client.send(command);
            console.log(`✅ Archivo guardado en S3: ${s3Key}`);

            return s3Key;
        } catch (error) {
            console.error('Error saving file to S3:', error);
            throw new Error('Failed to save file to S3');
        }
    }

    /**
     * Delete a file from S3
     * @param s3Key - S3 object key
     */
    async deleteFile(s3Key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: s3Key,
            });

            await this.s3Client.send(command);
            console.log(`✅ Archivo eliminado de S3: ${s3Key}`);
        } catch (error) {
            console.error('Error deleting file from S3:', error);
            throw new Error('Failed to delete file from S3');
        }
    }

    /**
     * Check if a file exists in S3
     * @param s3Key - S3 object key
     */
    async fileExists(s3Key: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: s3Key,
            });

            await this.s3Client.send(command);
            return true;
        } catch (error: any) {
            if (error.name === 'NotFound') {
                return false;
            }
            console.error('Error checking file existence in S3:', error);
            throw new Error('Failed to check file existence in S3');
        }
    }

    /**
     * Read a file from S3
     * @param s3Key - S3 object key
     */
    async readFile(s3Key: string): Promise<Buffer> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: s3Key,
            });

            const response = await this.s3Client.send(command);
            const buffer = await response.Body?.transformToByteArray();
            
            if (!buffer) {
                throw new Error('Failed to read file body from S3');
            }

            return Buffer.from(buffer);
        } catch (error) {
            console.error('Error reading file from S3:', error);
            throw new Error('Failed to read file from S3');
        }
    }

    /**
     * Get file size in bytes from S3
     * @param s3Key - S3 object key
     */
    async getFileSize(s3Key: string): Promise<number> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: s3Key,
            });

            const response = await this.s3Client.send(command);
            return response.ContentLength || 0;
        } catch (error) {
            console.error('Error getting file size from S3:', error);
            throw new Error('Failed to get file size');
        }
    }

    /**
     * Get public URL for a file in S3
     * @param s3Key - S3 object key
     * @returns Public S3 URL
     */
    getFileUrl(s3Key: string): string {
        return `https://${this.bucketName}.s3.${env.AWS_REGION}.amazonaws.com/${s3Key}`;
    }
}
