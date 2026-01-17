import dotenv from 'dotenv';
import * as process from "node:process";
dotenv.config();

export default {
    PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USERNAME: process.env.DB_USERNAME || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    DB_NAME: process.env.DB_NAME || 'database',
    // AWS Configuration
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || '',
}