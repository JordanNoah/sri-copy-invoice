"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyRoutes = void 0;
const hono_1 = require("hono");
const controller_1 = require("./controller");
const CompanyCredentialDatasource_impl_1 = require("@/infrastructure/datasource/CompanyCredentialDatasource.impl");
const CompanyCredentials_repository_impl_1 = require("@/infrastructure/repository/CompanyCredentials.repository.impl");
const InvoiceSequelizeDatasource_impl_1 = require("@/infrastructure/datasource/InvoiceSequelizeDatasource.impl");
const Invoice_repository_impl_1 = require("@/infrastructure/repository/Invoice.repository.impl");
const InvoiceDocumentSequelizeDatasource_impl_1 = require("@/infrastructure/datasource/InvoiceDocumentSequelizeDatasource.impl");
const InvoiceDocument_repository_impl_1 = require("@/infrastructure/repository/InvoiceDocument.repository.impl");
const file_service_1 = require("@/infrastructure/service/file.service");
const sri_service_1 = require("@/infrastructure/service/sri.service");
const company_credentials_1 = require("@/domain/use-cases/company-credentials");
class CompanyRoutes {
    get routes() {
        const router = new hono_1.Hono();
        // Inicializar dependencias de credenciales
        const credentialsDatasource = new CompanyCredentialDatasource_impl_1.CompanyCredentialsSequelizeDatasource();
        const credentialsRepository = new CompanyCredentials_repository_impl_1.CompanyCredentialsRepositoryImpl(credentialsDatasource);
        // Inicializar dependencias de facturas
        const invoiceDatasource = new InvoiceSequelizeDatasource_impl_1.InvoiceSequelizeDatasource();
        const invoiceRepository = new Invoice_repository_impl_1.InvoiceRepositoryImpl(invoiceDatasource);
        const invoiceDocumentDatasource = new InvoiceDocumentSequelizeDatasource_impl_1.InvoiceDocumentSequelizeDatasource();
        const invoiceDocumentRepository = new InvoiceDocument_repository_impl_1.InvoiceDocumentRepositoryImpl(invoiceDocumentDatasource);
        // Inicializar servicios
        const fileService = new file_service_1.FileService();
        const sriService = new sri_service_1.SRIService(fileService, invoiceRepository, invoiceDocumentRepository);
        // Inicializar use cases
        const saveCompanyCredentialsUseCase = new company_credentials_1.SaveCompanyCredentialsUseCase(credentialsRepository);
        const getAllCompanyCredentialsUseCase = new company_credentials_1.GetAllCompanyCredentialsUseCase(credentialsRepository);
        const getCompanyCredentialsByRucUseCase = new company_credentials_1.GetCompanyCredentialsByRucUseCase(credentialsRepository);
        const getDecryptedCredentialsByRucUseCase = new company_credentials_1.GetDecryptedCredentialsByRucUseCase(credentialsRepository);
        const updateCompanyPasswordUseCase = new company_credentials_1.UpdateCompanyPasswordUseCase(credentialsRepository);
        const deleteCompanyCredentialsUseCase = new company_credentials_1.DeleteCompanyCredentialsUseCase(credentialsRepository);
        const downloadInvoicesUseCase = new company_credentials_1.DownloadInvoicesUseCase(sriService, credentialsRepository, invoiceRepository);
        // Inicializar controller
        const controller = new controller_1.CompanyController(saveCompanyCredentialsUseCase, getAllCompanyCredentialsUseCase, getCompanyCredentialsByRucUseCase, getDecryptedCredentialsByRucUseCase, updateCompanyPasswordUseCase, deleteCompanyCredentialsUseCase, downloadInvoicesUseCase);
        // Definir rutas de credenciales
        router.post("/credentials", controller.saveCredentials);
        router.get("/credentials", controller.getAllCredentials);
        router.get("/credentials/:ruc", controller.getCredentialsByRuc);
        router.get("/credentials/:ruc/decrypted", controller.getDecryptedCredentials);
        router.patch("/credentials/:ruc/password", controller.updatePassword);
        router.delete("/credentials/:ruc", controller.deleteCredentials);
        // Definir ruta de descarga de facturas
        router.post("/:ruc/download-invoices", controller.downloadInvoices);
        return router;
    }
}
exports.CompanyRoutes = CompanyRoutes;
