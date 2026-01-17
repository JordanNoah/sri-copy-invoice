import { CompanyCredentialsRepository } from "@/domain/repository/CompanyCredentials.repository";

/**
 * Use Case: Actualizar contraseña de credenciales
 */
export class UpdateCompanyPasswordUseCase {
  constructor(private readonly repository: CompanyCredentialsRepository) {}

  async execute(ruc: string, newPassword: string): Promise<boolean> {
    return await this.repository.updatePassword(ruc, newPassword);
  }
}
