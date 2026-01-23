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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sriAutomatedLogin = sriAutomatedLogin;
const sri_service_1 = require("@/infrastructure/service/sri.service");
const CompanyCredentialDatasource_impl_1 = require("@/infrastructure/datasource/CompanyCredentialDatasource.impl");
const CompanyCredentials_repository_impl_1 = require("@/infrastructure/repository/CompanyCredentials.repository.impl");
const InvoiceSequelizeDatasource_impl_1 = require("@/infrastructure/datasource/InvoiceSequelizeDatasource.impl");
const Invoice_repository_impl_1 = require("@/infrastructure/repository/Invoice.repository.impl");
const InvoiceDocumentSequelizeDatasource_impl_1 = require("@/infrastructure/datasource/InvoiceDocumentSequelizeDatasource.impl");
const InvoiceDocument_repository_impl_1 = require("@/infrastructure/repository/InvoiceDocument.repository.impl");
const file_service_1 = require("@/infrastructure/service/file.service");
/**
 * Función automatizada para hacer login en el SRI y descargar facturas
 * Se ejecuta al iniciar el servidor para debugging
 */
function sriAutomatedLogin() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n========================================");
        console.log("🤖 Iniciando proceso automatizado del SRI");
        console.log("========================================\n");
        // Inicializar servicios y repositorios
        const invoiceDatasource = new InvoiceSequelizeDatasource_impl_1.InvoiceSequelizeDatasource();
        const invoiceRepository = new Invoice_repository_impl_1.InvoiceRepositoryImpl(invoiceDatasource);
        const invoiceDocumentDatasource = new InvoiceDocumentSequelizeDatasource_impl_1.InvoiceDocumentSequelizeDatasource();
        const invoiceDocumentRepository = new InvoiceDocument_repository_impl_1.InvoiceDocumentRepositoryImpl(invoiceDocumentDatasource);
        const fileService = new file_service_1.FileService();
        const sriService = new sri_service_1.SRIService(fileService, invoiceRepository, invoiceDocumentRepository);
        const datasource = new CompanyCredentialDatasource_impl_1.CompanyCredentialsSequelizeDatasource();
        const repository = new CompanyCredentials_repository_impl_1.CompanyCredentialsRepositoryImpl(datasource);
        try {
            // 1. Obtener todas las credenciales
            console.log("📋 Obteniendo credenciales guardadas...");
            const allCredentials = yield repository.getAll();
            if (allCredentials.length === 0) {
                console.log("⚠️  No hay credenciales guardadas. Proceso finalizado.");
                return;
            }
            console.log(`✅ Se encontraron ${allCredentials.length} empresa(s)\n`);
            // 2. Procesar cada empresa
            for (const credential of allCredentials) {
                console.log(`\n--- Procesando: ${credential.companyName} (${credential.ruc}) ---`);
                // Obtener credenciales desencriptadas
                const decryptedCreds = yield repository.getDecryptedByRuc(credential.ruc);
                if (!decryptedCreds) {
                    console.log(`❌ No se pudieron obtener credenciales para ${credential.ruc}`);
                    continue;
                }
                // Hacer login
                console.log(`🔐 Iniciando sesión en el SRI...`);
                const loginSuccess = yield sriService.login(decryptedCreds.username, decryptedCreds.password, credential.companyUuid, credential.ruc);
                if (!loginSuccess) {
                    console.log(`❌ Login fallido para ${credential.companyName}`);
                    console.log(`   Verifica las credenciales en la base de datos\n`);
                    yield sriService.close();
                    continue;
                }
                console.log(`✅ Login exitoso para ${credential.companyName}`);
                // Descargar facturas (últimos 30 días por defecto)
                const today = new Date();
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                const fechaInicio = formatDate(thirtyDaysAgo);
                const fechaFin = formatDate(today);
                console.log(`📥 Descargando facturas desde ${fechaInicio} hasta ${fechaFin}...`);
                try {
                    const downloadedInvoices = yield sriService.downloadInvoices(fechaInicio);
                    console.log(`✅ Facturas descargadas: ${downloadedInvoices.length}`);
                }
                catch (downloadError) {
                    console.error(`❌ Error al descargar facturas:`, downloadError);
                }
                // Cerrar navegador para esta empresa
                yield sriService.close();
                console.log(`🔒 Sesión cerrada para ${credential.companyName}`);
            }
            console.log("\n========================================");
            console.log("✅ Proceso automatizado completado");
            console.log("========================================\n");
        }
        catch (error) {
            console.error("\n❌ Error en el proceso automatizado del SRI:", error);
            yield sriService.close();
        }
    });
}
/**
 * Formatear fecha a formato DD/MM/YYYY
 */
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
