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
exports.CompanyController = void 0;
const CompanyCredentials_1 = require("@/domain/dto/CompanyCredentials");
class CompanyController {
    constructor(saveCompanyCredentialsUseCase, getAllCompanyCredentialsUseCase, getCompanyCredentialsByRucUseCase, getDecryptedCredentialsByRucUseCase, updateCompanyPasswordUseCase, deleteCompanyCredentialsUseCase, downloadInvoicesUseCase) {
        this.saveCompanyCredentialsUseCase = saveCompanyCredentialsUseCase;
        this.getAllCompanyCredentialsUseCase = getAllCompanyCredentialsUseCase;
        this.getCompanyCredentialsByRucUseCase = getCompanyCredentialsByRucUseCase;
        this.getDecryptedCredentialsByRucUseCase = getDecryptedCredentialsByRucUseCase;
        this.updateCompanyPasswordUseCase = updateCompanyPasswordUseCase;
        this.deleteCompanyCredentialsUseCase = deleteCompanyCredentialsUseCase;
        this.downloadInvoicesUseCase = downloadInvoicesUseCase;
        /**
         * POST /api/v1/company/credentials
         * Crear o actualizar credenciales (UPSERT)
         */
        this.saveCredentials = (c) => __awaiter(this, void 0, void 0, function* () {
            try {
                const body = yield c.req.json();
                const { companyName, ruc, username, password } = body;
                if (!companyName || !ruc || !username || !password) {
                    return c.json({
                        error: "Todos los campos son requeridos: companyName, ruc, username, password",
                    }, 400);
                }
                if (ruc.length !== 13 || !/^\d+$/.test(ruc)) {
                    return c.json({
                        error: "El RUC debe tener exactamente 13 dígitos numéricos",
                    }, 400);
                }
                const dto = new CompanyCredentials_1.CompanyCredentialsDto(companyName, ruc, username, password);
                const result = yield this.saveCompanyCredentialsUseCase.execute(dto);
                return c.json({
                    message: "Credenciales guardadas exitosamente",
                    data: result.toPublicData(),
                }, 201);
            }
            catch (error) {
                console.error("Error saving credentials:", error);
                return c.json({
                    error: "Error al guardar credenciales",
                    details: error instanceof Error ? error.message : "Error desconocido",
                }, 500);
            }
        });
        /**
         * GET /api/v1/company/credentials
         * Obtener todas las credenciales
         */
        this.getAllCredentials = (c) => __awaiter(this, void 0, void 0, function* () {
            try {
                const credentials = yield this.getAllCompanyCredentialsUseCase.execute();
                return c.json({
                    message: "Credenciales obtenidas exitosamente",
                    data: credentials.map((cred) => cred.toPublicData()),
                    count: credentials.length,
                });
            }
            catch (error) {
                console.error("Error getting all credentials:", error);
                return c.json({
                    error: "Error al obtener credenciales",
                    details: error instanceof Error ? error.message : "Error desconocido",
                }, 500);
            }
        });
        /**
         * GET /api/v1/company/credentials/:ruc
         * Obtener credenciales por RUC (sin contraseña)
         */
        this.getCredentialsByRuc = (c) => __awaiter(this, void 0, void 0, function* () {
            try {
                const ruc = c.req.param("ruc");
                if (!ruc) {
                    return c.json({ error: "RUC es requerido" }, 400);
                }
                const credentials = yield this.getCompanyCredentialsByRucUseCase.execute(ruc);
                if (!credentials) {
                    return c.json({ error: "Credenciales no encontradas" }, 404);
                }
                return c.json({
                    message: "Credenciales obtenidas exitosamente",
                    data: credentials.toPublicData(),
                });
            }
            catch (error) {
                console.error("Error getting credentials by RUC:", error);
                return c.json({
                    error: "Error al obtener credenciales",
                    details: error instanceof Error ? error.message : "Error desconocido",
                }, 500);
            }
        });
        /**
         * GET /api/v1/company/credentials/:ruc/decrypted
         * Obtener credenciales desencriptadas (con contraseña en texto plano)
         */
        this.getDecryptedCredentials = (c) => __awaiter(this, void 0, void 0, function* () {
            try {
                const ruc = c.req.param("ruc");
                if (!ruc) {
                    return c.json({ error: "RUC es requerido" }, 400);
                }
                const credentials = yield this.getDecryptedCredentialsByRucUseCase.execute(ruc);
                if (!credentials) {
                    return c.json({ error: "Credenciales no encontradas" }, 404);
                }
                return c.json({
                    message: "Credenciales desencriptadas obtenidas exitosamente",
                    data: credentials,
                });
            }
            catch (error) {
                console.error("Error getting decrypted credentials:", error);
                return c.json({
                    error: "Error al obtener credenciales desencriptadas",
                    details: error instanceof Error ? error.message : "Error desconocido",
                }, 500);
            }
        });
        /**
         * PATCH /api/v1/company/credentials/:ruc/password
         * Actualizar solo la contraseña
         */
        this.updatePassword = (c) => __awaiter(this, void 0, void 0, function* () {
            try {
                const ruc = c.req.param("ruc");
                const body = yield c.req.json();
                const { password } = body;
                if (!ruc) {
                    return c.json({ error: "RUC es requerido" }, 400);
                }
                if (!password) {
                    return c.json({ error: "La nueva contraseña es requerida" }, 400);
                }
                const updated = yield this.updateCompanyPasswordUseCase.execute(ruc, password);
                if (!updated) {
                    return c.json({ error: "Credenciales no encontradas" }, 404);
                }
                return c.json({
                    message: "Contraseña actualizada exitosamente",
                });
            }
            catch (error) {
                console.error("Error updating password:", error);
                return c.json({
                    error: "Error al actualizar contraseña",
                    details: error instanceof Error ? error.message : "Error desconocido",
                }, 500);
            }
        });
        /**
         * DELETE /api/v1/company/credentials/:ruc
         * Eliminar credenciales
         */
        this.deleteCredentials = (c) => __awaiter(this, void 0, void 0, function* () {
            try {
                const ruc = c.req.param("ruc");
                if (!ruc) {
                    return c.json({ error: "RUC es requerido" }, 400);
                }
                const deleted = yield this.deleteCompanyCredentialsUseCase.execute(ruc);
                if (!deleted) {
                    return c.json({ error: "Credenciales no encontradas" }, 404);
                }
                return c.json({
                    message: "Credenciales eliminadas exitosamente",
                });
            }
            catch (error) {
                console.error("Error deleting credentials:", error);
                return c.json({
                    error: "Error al eliminar credenciales",
                    details: error instanceof Error ? error.message : "Error desconocido",
                }, 500);
            }
        });
        /**
         * POST /api/v1/company/:ruc/download-invoices
         * Descargar facturas del SRI y guardarlas en BD y S3
         */
        this.downloadInvoices = (c) => __awaiter(this, void 0, void 0, function* () {
            try {
                const ruc = c.req.param("ruc");
                const body = yield c.req.json().catch(() => ({}));
                if (!ruc) {
                    return c.json({ error: "RUC es requerido" }, 400);
                }
                if (ruc.length !== 13 || !/^\d+$/.test(ruc)) {
                    return c.json({
                        error: "El RUC debe tener exactamente 13 dígitos numéricos",
                    }, 400);
                }
                console.log(`Iniciando descarga de facturas para RUC: ${ruc}, fechaInicio: ${body.fechaInicio}`);
                const downloadedInvoices = yield this.downloadInvoicesUseCase.execute(ruc, body.fechaInicio);
                return c.json({
                    message: "Facturas descargadas exitosamente",
                    data: downloadedInvoices,
                    count: downloadedInvoices.length,
                }, 200);
            }
            catch (error) {
                console.error("Error downloading invoices:", error);
                return c.json({
                    error: "Error al descargar facturas",
                    details: error instanceof Error ? error.message : "Error desconocido",
                }, 500);
            }
        });
    }
}
exports.CompanyController = CompanyController;
