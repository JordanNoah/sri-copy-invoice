import { Hono } from "hono";
import { CompanyController } from "./controller";
import { CompanyCredentialsSequelizeDatasource } from "@/infrastructure/datasource/CompanyCredentialDatasource.impl";
import { CompanyCredentialsRepositoryImpl } from "@/infrastructure/repository/CompanyCredentials.repository.impl";
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

    // Inicializar dependencias
    const datasource = new CompanyCredentialsSequelizeDatasource();
    const repository = new CompanyCredentialsRepositoryImpl(datasource);

    // Inicializar use cases
    const saveCompanyCredentialsUseCase = new SaveCompanyCredentialsUseCase(repository);
    const getAllCompanyCredentialsUseCase = new GetAllCompanyCredentialsUseCase(repository);
    const getCompanyCredentialsByRucUseCase = new GetCompanyCredentialsByRucUseCase(repository);
    const getDecryptedCredentialsByRucUseCase = new GetDecryptedCredentialsByRucUseCase(repository);
    const updateCompanyPasswordUseCase = new UpdateCompanyPasswordUseCase(repository);
    const deleteCompanyCredentialsUseCase = new DeleteCompanyCredentialsUseCase(repository);

    // Inicializar controller
    const controller = new CompanyController(
      saveCompanyCredentialsUseCase,
      getAllCompanyCredentialsUseCase,
      getCompanyCredentialsByRucUseCase,
      getDecryptedCredentialsByRucUseCase,
      updateCompanyPasswordUseCase,
      deleteCompanyCredentialsUseCase
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
