/**
 * EJEMPLO DE INTEGRACIÓN - Email Service
 * ========================================
 * 
 * El servicio de email solo envía notificaciones cuando ocurren ERRORES.
 * NO envía emails de éxito para evitar saturar la bandeja de entrada.
 */

import { EmailService } from './email.service';

// Crear instancia del servicio
const emailService = new EmailService();

// =============================================================================
// EJEMPLO 1: Notificar un error simple
// =============================================================================
async function example1_SimpleError() {
    try {
        // Tu código que puede fallar
        throw new Error('No se pudo conectar con el SRI');
    } catch (error) {
        await emailService.sendErrorNotification({
            service: 'SRI Automation',
            error: error as Error,
        });
    }
}

// =============================================================================
// EJEMPLO 2: Notificar error con contexto adicional
// =============================================================================
async function example2_ErrorWithContext() {
    const companyRuc = '1234567890001';
    const invoiceNumber = 'FAC-001-001-000001234';
    
    try {
        // Tu código que puede fallar
        throw new Error('Error al descargar factura');
    } catch (error) {
        await emailService.sendErrorNotification({
            service: 'Invoice Download',
            error: error as Error,
            companyRuc,
            context: {
                invoiceNumber,
                downloadAttempts: 3,
                lastAttemptTime: new Date().toISOString(),
            },
        });
    }
}

// =============================================================================
// EJEMPLO 3: Integración en un servicio
// =============================================================================
class SRIServiceWithEmails {
    private emailService = new EmailService();

    async downloadInvoices(companyRuc: string) {
        try {
            console.log('Descargando facturas...');
            // Tu lógica de descarga
            
            // ✅ NO enviamos email de éxito, solo logueamos
            console.log('✅ Facturas descargadas exitosamente');
            
        } catch (error) {
            // ❌ SÍ enviamos email cuando hay error
            await this.emailService.sendErrorNotification({
                service: 'SRI Invoice Download',
                error: error as Error,
                companyRuc,
                context: {
                    operation: 'downloadInvoices',
                },
            });
            throw error; // Re-lanzar el error
        }
    }
}

// =============================================================================
// EJEMPLO 4: Cron Job con manejo de errores
// =============================================================================
class CronJobWithEmails {
    private emailService = new EmailService();

    async executeDailyDownload() {
        const companies = ['1234567890001', '0987654321001'];
        const failed: string[] = [];

        for (const ruc of companies) {
            try {
                console.log(`Procesando ${ruc}...`);
                // Tu lógica de descarga
                console.log(`✅ ${ruc} procesado`);
            } catch (error) {
                failed.push(ruc);
                
                // Notificar error individual
                await this.emailService.sendErrorNotification({
                    service: 'Daily Download Cron',
                    error: error as Error,
                    companyRuc: ruc,
                });
            }
        }

        // Si hubo errores, enviar resumen
        if (failed.length > 0) {
            await this.emailService.sendErrorNotification({
                service: 'Daily Download Cron - Summary',
                error: new Error(`${failed.length} empresas fallaron en el proceso diario`),
                context: {
                    failedCompanies: failed,
                    totalCompanies: companies.length,
                    timestamp: new Date().toISOString(),
                },
            });
        }
        
        // ✅ Si todo fue exitoso, solo logueamos (NO enviamos email)
        if (failed.length === 0) {
            console.log('✅ Todas las empresas procesadas exitosamente');
        }
    }
}

// =============================================================================
// EJEMPLO 5: Verificar configuración al iniciar
// =============================================================================
async function verifyEmailOnStartup() {
    const emailService = new EmailService();
    const isReady = await emailService.verifyConnection();
    
    if (!isReady) {
        console.warn('⚠️  Email service is not properly configured');
    }
}

export {
    example1_SimpleError,
    example2_ErrorWithContext,
    SRIServiceWithEmails,
    CronJobWithEmails,
    verifyEmailOnStartup,
};
