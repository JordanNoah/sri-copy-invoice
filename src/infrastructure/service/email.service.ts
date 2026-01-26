import nodemailer, { Transporter } from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import env from '@/shared/env';
import {
    generateErrorEmailHTML,
    generateErrorEmailText,
    type ErrorEmailData,
} from './templates';

export interface EmailOptions {
    to?: string | string[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        content?: Buffer | string;
        path?: string;
    }>;
}

/**
 * Email Service - Solo para notificaciones de errores críticos
 * 
 * Este servicio está diseñado para enviar alertas por email únicamente
 * cuando ocurren errores en el sistema que requieren atención inmediata.
 * 
 * NO envía notificaciones de éxito para evitar saturar la bandeja de entrada.
 */
export class EmailService {
    private transporter: Transporter | null = null;
    private sesClient: SESClient | null = null;
    private readonly from: string;
    private readonly alertsTo: string[];

    constructor() {
        this.from = env.EMAIL_FROM;
        this.alertsTo = env.EMAIL_ALERTS_TO;
        this.initializeTransport();
    }

    private initializeTransport() {
        const service = env.EMAIL_SERVICE.toLowerCase();

        if (service === 'ses') {
            // AWS SES
            this.sesClient = new SESClient({
                region: env.AWS_REGION,
                credentials: {
                    accessKeyId: env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
                },
            });
        } else if (service === 'gmail') {
            // Gmail configuration
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: env.EMAIL_USER,
                    pass: env.EMAIL_PASSWORD,
                },
            });
        } else {
            // Generic SMTP
            this.transporter = nodemailer.createTransport({
                host: env.EMAIL_HOST,
                port: env.EMAIL_PORT,
                secure: env.EMAIL_SECURE,
                auth: {
                    user: env.EMAIL_USER,
                    pass: env.EMAIL_PASSWORD,
                },
            });
        }
    }

    /**
     * Send a generic email (uso interno o casos especiales)
     */
    async sendEmail(options: EmailOptions): Promise<void> {
        try {
            const recipients = options.to || this.alertsTo;
            const to = Array.isArray(recipients) ? recipients : [recipients];

            if (to.length === 0) {
                console.warn('No email recipients configured. Skipping email send.');
                return;
            }

            if (this.sesClient) {
                await this.sendWithSES(to, options);
            } else if (this.transporter) {
                await this.sendWithSMTP(to, options);
            } else {
                throw new Error('Email transport not configured');
            }

            console.log(`📧 Email sent successfully to: ${to.join(', ')}`);
        } catch (error) {
            console.error('❌ Error sending email:', error);
            // No lanzamos el error para evitar que falle el proceso principal
            // si el envío de email falla
        }
    }

    /**
     * Send email using AWS SES
     */
    private async sendWithSES(to: string[], options: EmailOptions): Promise<void> {
        if (!this.sesClient) {
            throw new Error('SES client not initialized');
        }

        const command = new SendEmailCommand({
            Source: this.from,
            Destination: {
                ToAddresses: to,
            },
            Message: {
                Subject: {
                    Data: options.subject,
                    Charset: 'UTF-8',
                },
                Body: {
                    Html: options.html
                        ? {
                              Data: options.html,
                              Charset: 'UTF-8',
                          }
                        : undefined,
                    Text: options.text
                        ? {
                              Data: options.text,
                              Charset: 'UTF-8',
                          }
                        : undefined,
                },
            },
        });

        await this.sesClient.send(command);
    }

    /**
     * Send email using SMTP/Gmail
     */
    private async sendWithSMTP(to: string[], options: EmailOptions): Promise<void> {
        if (!this.transporter) {
            throw new Error('Email transporter not initialized');
        }

        await this.transporter.sendMail({
            from: this.from,
            to: to.join(', '),
            subject: options.subject,
            html: options.html,
            text: options.text,
            attachments: options.attachments,
        });
    }

    /**
     * Send error notification email
     * 
     * Envía una alerta por email cuando ocurre un error crítico en el sistema.
     * Incluye el stack trace completo, contexto adicional y detalles del error.
     * 
     * @param data - Datos del error a notificar
     * 
     * @example
     * ```typescript
     * try {
     *     await downloadInvoice();
     * } catch (error) {
     *     await emailService.sendErrorNotification({
     *         service: 'Invoice Download',
     *         error: error as Error,
     *         companyRuc: '1234567890001',
     *         context: {
     *             invoiceNumber: 'FAC-001-001-000001234',
     *             attempts: 3,
     *         },
     *     });
     * }
     * ```
     */
    async sendErrorNotification(data: {
        service: string;
        error: Error;
        context?: Record<string, any>;
        timestamp?: Date;
        companyRuc?: string;
    }): Promise<void> {
        try {
            const emailData: ErrorEmailData = {
                service: data.service,
                error: data.error,
                context: data.context,
                timestamp: data.timestamp || new Date(),
                companyRuc: data.companyRuc,
            };

            const html = generateErrorEmailHTML(emailData);
            const text = generateErrorEmailText(emailData);

            await this.sendEmail({
                subject: `🚨 Error en ${data.service} - SRI Invoice System`,
                html,
                text,
            });
        } catch (emailError) {
            // Logueamos el error pero no lo propagamos para evitar
            // que un fallo en el envío de email afecte el proceso principal
            console.error('❌ Failed to send error notification email:', emailError);
        }
    }

    /**
     * Verify email configuration
     * 
     * Verifica que el servicio de email esté configurado correctamente.
     * Útil para ejecutar al inicio de la aplicación.
     */
    async verifyConnection(): Promise<boolean> {
        try {
            if (this.transporter) {
                await this.transporter.verify();
                console.log('✅ Email service ready');
                return true;
            } else if (this.sesClient) {
                console.log('✅ SES client configured');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Email service verification failed:', error);
            return false;
        }
    }
}
