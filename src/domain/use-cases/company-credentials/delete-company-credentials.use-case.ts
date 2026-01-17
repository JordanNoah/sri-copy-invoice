import { CompanyCredentialsRepository } from "@/domain/repository/CompanyCredentials.repository";

/**
 * Use Case: Eliminar credenciales de empresa
 */
export class DeleteCompanyCredentialsUseCase {
  constructor(private readonly repository: CompanyCredentialsRepository) {}

  async execute(ruc: string): Promise<boolean> {
    return await this.repository.delete(ruc);
  }
}
