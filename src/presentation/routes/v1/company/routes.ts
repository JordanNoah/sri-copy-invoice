import { Hono } from "hono";
import { CompanyController } from "./controller";
import { CompanyCredentialsSequelizeDatasource } from "@/infrastructure/datasource/CompanyCredentialDatasource.impl";
import { CompanyCredentialsRepositoryImpl } from "@/infrastructure/repository/CompanyCredentials.repository.impl";
import { InvoiceDatasourceImpl } from "@/infrastructure/datasource/InvoiceDatasource.impl";
import { InvoiceRepositoryImpl } from "@/infrastructure/repository/Invoice.repository.impl";
import { InvoiceDocumentSequelizeDatasource } from "@/infrastructure/datasource/InvoiceDocumentDatasource.impl";
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
} from "@/domain/use-cases/company-credentials";

export class CompanyRoutes {
  public get routes(): Hono {
    const router = new Hono();

    // Inicializar dependencias de credenciales
    const credentialsDatasource = new CompanyCredentialsSequelizeDatasource();
    const credentialsRepository = new CompanyCredentialsRepositoryImpl(credentialsDatasource);

    // Inicializar dependencias de facturas
    const invoiceDatasource = new InvoiceDatasourceImpl();
    const invoiceRepository = new InvoiceRepositoryImpl(invoiceDatasource);

    const invoiceDocumentDatasource = new InvoiceDocumentSequelizeDatasource();
    const invoiceDocumentRepository = new InvoiceDocumentRepositoryImpl(invoiceDocumentDatasource);

    // Inicializar use cases
    const saveCompanyCredentialsUseCase = new SaveCompanyCredentialsUseCase(credentialsRepository);
    const getAllCompanyCredentialsUseCase = new GetAllCompanyCredentialsUseCase(credentialsRepository);
    const getCompanyCredentialsByRucUseCase = new GetCompanyCredentialsByRucUseCase(credentialsRepository);
    const getDecryptedCredentialsByRucUseCase = new GetDecryptedCredentialsByRucUseCase(credentialsRepository);
    const updateCompanyPasswordUseCase = new UpdateCompanyPasswordUseCase(credentialsRepository);
    const deleteCompanyCredentialsUseCase = new DeleteCompanyCredentialsUseCase(credentialsRepository);
    

    // Inicializar controller
    const controller = new CompanyController(
      saveCompanyCredentialsUseCase,
      getAllCompanyCredentialsUseCase,
      getCompanyCredentialsByRucUseCase,
      getDecryptedCredentialsByRucUseCase,
      updateCompanyPasswordUseCase,
      deleteCompanyCredentialsUseCase,
    );

    // Definir rutas de credenciales
    router.post("/credentials", controller.saveCredentials);
    router.get("/credentials", controller.getAllCredentials);
    router.get("/credentials/:ruc", controller.getCredentialsByRuc);
    router.get("/credentials/:ruc/decrypted", controller.getDecryptedCredentials);
    router.patch("/credentials/:ruc/password", controller.updatePassword);
    router.delete("/credentials/:ruc", controller.deleteCredentials);

    return router;
  }
}
