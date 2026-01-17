import { CompanyCredentialsRepository } from "@/domain/repository/CompanyCredentials.repository";
import { CompanyCredentialsEntity } from "@/domain/entity/CompanyCredentials";

/**
 * Use Case: Obtener todas las credenciales
 */
export class GetAllCompanyCredentialsUseCase {
  constructor(private readonly repository: CompanyCredentialsRepository) {}

  async execute(): Promise<CompanyCredentialsEntity[]> {
    return await this.repository.getAll();
  }
}
