"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = __importDefault(require("@/shared/env"));
class FileService {
    constructor() {
        this.filesPrefix = 'files';
        this.bucketName = env_1.default.AWS_S3_BUCKET;
        this.s3Client = new client_s3_1.S3Client({
            region: env_1.default.AWS_REGION,
            credentials: {
                accessKeyId: env_1.default.AWS_ACCESS_KEY_ID,
                secretAccessKey: env_1.default.AWS_SECRET_ACCESS_KEY,
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
    saveFile(buffer, fileName, companyRuc) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Generate S3 key: files/RUC/YEAR/FILENAME
                const year = new Date().getFullYear();
                const s3Key = `${this.filesPrefix}/${companyRuc}/${year}/${fileName}`;
                // Upload to S3
                const command = new client_s3_1.PutObjectCommand({
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
                yield this.s3Client.send(command);
                console.log(`✅ Archivo guardado en S3: ${s3Key}`);
                return s3Key;
            }
            catch (error) {
                console.error('Error saving file to S3:', error);
                throw new Error('Failed to save file to S3');
            }
        });
    }
    /**
     * Delete a file from S3
     * @param s3Key - S3 object key
     */
    deleteFile(s3Key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new client_s3_1.DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: s3Key,
                });
                yield this.s3Client.send(command);
                console.log(`✅ Archivo eliminado de S3: ${s3Key}`);
            }
            catch (error) {
                console.error('Error deleting file from S3:', error);
                throw new Error('Failed to delete file from S3');
            }
        });
    }
    /**
     * Check if a file exists in S3
     * @param s3Key - S3 object key
     */
    fileExists(s3Key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new client_s3_1.HeadObjectCommand({
                    Bucket: this.bucketName,
                    Key: s3Key,
                });
                yield this.s3Client.send(command);
                return true;
            }
            catch (error) {
                if (error.name === 'NotFound') {
                    return false;
                }
                console.error('Error checking file existence in S3:', error);
                throw new Error('Failed to check file existence in S3');
            }
        });
    }
    /**
     * Read a file from S3
     * @param s3Key - S3 object key
     */
    readFile(s3Key) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const command = new client_s3_1.GetObjectCommand({
                    Bucket: this.bucketName,
                    Key: s3Key,
                });
                const response = yield this.s3Client.send(command);
                const buffer = yield ((_a = response.Body) === null || _a === void 0 ? void 0 : _a.transformToByteArray());
                if (!buffer) {
                    throw new Error('Failed to read file body from S3');
                }
                return Buffer.from(buffer);
            }
            catch (error) {
                console.error('Error reading file from S3:', error);
                throw new Error('Failed to read file from S3');
            }
        });
    }
    /**
     * Get file size in bytes from S3
     * @param s3Key - S3 object key
     */
    getFileSize(s3Key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const command = new client_s3_1.HeadObjectCommand({
                    Bucket: this.bucketName,
                    Key: s3Key,
                });
                const response = yield this.s3Client.send(command);
                return response.ContentLength || 0;
            }
            catch (error) {
                console.error('Error getting file size from S3:', error);
                throw new Error('Failed to get file size');
            }
        });
    }
    /**
     * Get public URL for a file in S3
     * @param s3Key - S3 object key
     * @returns Public S3 URL
     */
    getFileUrl(s3Key) {
        return `https://${this.bucketName}.s3.${env_1.default.AWS_REGION}.amazonaws.com/${s3Key}`;
    }
}
exports.FileService = FileService;
