import { SRIService } from "@/infrastructure/service/sri.service";
import { CompanyCredentialsRepository } from "@/domain/repository/CompanyCredentials.repository";

/**
 * Use Case: Hacer login en el SRI usando credenciales almacenadas
 */
export class LoginToSRIUseCase {
  constructor(
    private readonly repository: CompanyCredentialsRepository,
    private readonly sriService: SRIService
  ) {}

  async execute(ruc: string): Promise<{
    success: boolean;
    message: string;
  }> {
    // 1. Obtener credenciales desencriptadas
    const credentials = await this.repository.getDecryptedByRuc(ruc);

    if (!credentials) {
      return {
        success: false,
        message: `No se encontraron credenciales para el RUC: ${ruc}`,
      };
    }

    // 2. Intentar hacer login en el SRI
    try {
      const loginSuccess = await this.sriService.login(
        credentials.username,
        credentials.password
      );

      if (loginSuccess) {
        return {
          success: true,
          message: `Login exitoso en el SRI para ${credentials.companyName}`,
        };
      } else {
        return {
          success: false,
          message: "Login fallido. Verifica las credenciales.",
        };
      }
    } catch (error) {
      console.error("Error en LoginToSRIUseCase:", error);
      return {
        success: false,
        message: `Error al intentar hacer login: ${error instanceof Error ? error.message : "Error desconocido"}`,
      };
    }
  }
}
