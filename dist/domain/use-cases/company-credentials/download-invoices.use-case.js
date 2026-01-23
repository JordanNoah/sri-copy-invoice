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
exports.DownloadInvoicesUseCase = void 0;
/**
 * Use case: Descargar facturas del SRI para una empresa
 * 1. Obtener credenciales de la empresa
 * 2. Hacer login en el SRI
 * 3. Descargar facturas con sus documentos (XML/PDF)
 * 4. Guardar en BD y S3
 */
class DownloadInvoicesUseCase {
    constructor(sriService, companyCredentialsRepository, invoiceRepository) {
        this.sriService = sriService;
        this.companyCredentialsRepository = companyCredentialsRepository;
        this.invoiceRepository = invoiceRepository;
    }
    /**
     * Ejecutar descarga de facturas
     * @param companyRuc RUC de la empresa
     * @param fechaInicio Fecha inicio (opcional)
     * @returns Lista de facturas descargadas
     */
    execute(companyRuc, fechaInicio) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`\n📥 Iniciando descarga de facturas para RUC: ${companyRuc}`);
            try {
                // 1. Obtener credenciales de la empresa
                console.log("1️⃣  Obteniendo credenciales de la empresa...");
                const credentials = yield this.companyCredentialsRepository.getByRuc(companyRuc);
                if (!credentials) {
                    throw new Error(`No se encontraron credenciales para el RUC: ${companyRuc}`);
                }
                // 2. Desencriptar contraseña
                console.log("2️⃣  Desencriptando credenciales...");
                // TODO: Implementar desencriptación si es necesario
                const username = credentials.username;
                const password = credentials.password; // o credentials.decryptedPassword si existe
                // 3. Hacer login en el SRI
                console.log("3️⃣  Iniciando sesión en el SRI...");
                const loginSuccess = yield this.sriService.login(username, password, credentials.companyUuid, companyRuc);
                if (!loginSuccess) {
                    throw new Error("Fallo al iniciar sesión en el SRI");
                }
                console.log("✅ Login exitoso en el SRI");
                // 4. Descargar facturas
                console.log("4️⃣  Descargando facturas...");
                const downloadedInvoices = yield this.sriService.downloadInvoices(fechaInicio || new Date().toISOString().split("T")[0]);
                console.log(`\n✅ Descarga completada: ${downloadedInvoices.length} facturas procesadas`);
                return downloadedInvoices;
            }
            catch (error) {
                console.error("❌ Error durante la descarga de facturas:", error);
                throw error;
            }
            finally {
                // Siempre cerrar el navegador
                yield this.sriService.close();
            }
        });
    }
}
exports.DownloadInvoicesUseCase = DownloadInvoicesUseCase;
