import { CompanyCredentialsRepository } from "@/domain/repository/CompanyCredentials.repository";
import { CompanyCredentialsDto } from "@/domain/dto/CompanyCredentials";

/**
 * Use Case: Obtener credenciales desencriptadas por RUC
 */
export class GetDecryptedCredentialsByRucUseCase {
  constructor(private readonly repository: CompanyCredentialsRepository) {}

  async execute(ruc: string): Promise<CompanyCredentialsDto | null> {
    return await this.repository.getDecryptedByRuc(ruc);
  }
}
