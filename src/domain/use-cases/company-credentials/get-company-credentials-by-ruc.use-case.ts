import { CompanyCredentialsRepository } from "@/domain/repository/CompanyCredentials.repository";
import { CompanyCredentialsEntity } from "@/domain/entity/CompanyCredentials";

/**
 * Use Case: Obtener credenciales por RUC
 */
export class GetCompanyCredentialsByRucUseCase {
  constructor(private readonly repository: CompanyCredentialsRepository) {}

  async execute(ruc: string): Promise<CompanyCredentialsEntity | null> {
    return await this.repository.getByRuc(ruc);
  }
}
