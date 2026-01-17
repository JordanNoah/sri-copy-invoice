import { CompanyCredentialsRepository } from "@/domain/repository/CompanyCredentials.repository";
import { CompanyCredentialsDto } from "@/domain/dto/CompanyCredentials";
import { CompanyCredentialsEntity } from "@/domain/entity/CompanyCredentials";

/**
 * Use Case: Guardar credenciales de empresa (crear o actualizar)
 */
export class SaveCompanyCredentialsUseCase {
  constructor(private readonly repository: CompanyCredentialsRepository) {}

  async execute(dto: CompanyCredentialsDto): Promise<CompanyCredentialsEntity> {
    return await this.repository.upsert(dto);
  }
}
