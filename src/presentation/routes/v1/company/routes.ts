import { Hono } from "hono";
import { CompanyController } from "./controller";
import { CompanyCredentialsSequelizeDatasource } from "@/infrastructure/datasource/CompanyCredentialDatasource.impl";
import { CompanyCredentialsRepositoryImpl } from "@/infrastructure/repository/CompanyCredentials.repository.impl";
import { InvoiceSequelizeDatasource } from "@/infrastructure/datasource/InvoiceSequelizeDatasource.impl";
import { InvoiceRepositoryImpl } from "@/infrastructure/repository/Invoice.repository.impl";
import { InvoiceDocumentSequelizeDatasource } from "@/infrastructure/datasource/InvoiceDocumentSequelizeDatasource.impl";
import { InvoiceDocumentRepositoryImpl } from "@/infrastructure/repository/InvoiceDocument.repository.impl";
import { FileService } from "@/infrastructure/service/file.service";
import { SRIService } from "@/infrastructure/service/sri.service";
import {
  SaveCompanyCredentialsUseCase,
  GetAllCompanyCredentialsUseCase,
  GetCompanyCredentialsByRucUseCase,
  GetDecryptedCredentialsByRucUseCase,
  UpdateCompanyPasswordUseCase,
  DeleteCompanyCredentialsUseCase,
  DownloadInvoicesUseCase,
} from "@/domain/use-cases/company-credentials";

export class CompanyRoutes {
  public get routes(): Hono {
    const router = new Hono();

    // Inicializar dependencias de credenciales
    const credentialsDatasource = new CompanyCredentialsSequelizeDatasource();
    const credentialsRepository = new CompanyCredentialsRepositoryImpl(credentialsDatasource);

    // Inicializar dependencias de facturas
    const invoiceDatasource = new InvoiceSequelizeDatasource();
    const invoiceRepository = new InvoiceRepositoryImpl(invoiceDatasource);

    const invoiceDocumentDatasource = new InvoiceDocumentSequelizeDatasource();
    const invoiceDocumentRepository = new InvoiceDocumentRepositoryImpl(invoiceDocumentDatasource);

    // Inicializar servicios
    const fileService = new FileService();
    const sriService = new SRIService(fileService, invoiceRepository, invoiceDocumentRepository);

    // Inicializar use cases
    const saveCompanyCredentialsUseCase = new SaveCompanyCredentialsUseCase(credentialsRepository);
    const getAllCompanyCredentialsUseCase = new GetAllCompanyCredentialsUseCase(credentialsRepository);
    const getCompanyCredentialsByRucUseCase = new GetCompanyCredentialsByRucUseCase(credentialsRepository);
    const getDecryptedCredentialsByRucUseCase = new GetDecryptedCredentialsByRucUseCase(credentialsRepository);
    const updateCompanyPasswordUseCase = new UpdateCompanyPasswordUseCase(credentialsRepository);
    const deleteCompanyCredentialsUseCase = new DeleteCompanyCredentialsUseCase(credentialsRepository);
    const downloadInvoicesUseCase = new DownloadInvoicesUseCase(
      sriService,
      credentialsRepository,
      invoiceRepository
    );

    // Inicializar controller
    const controller = new CompanyController(
      saveCompanyCredentialsUseCase,
      getAllCompanyCredentialsUseCase,
      getCompanyCredentialsByRucUseCase,
      getDecryptedCredentialsByRucUseCase,
      updateCompanyPasswordUseCase,
      deleteCompanyCredentialsUseCase,
      downloadInvoicesUseCase
    );

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
