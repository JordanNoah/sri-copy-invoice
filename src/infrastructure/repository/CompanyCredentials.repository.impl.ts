import { CompanyCredentialsRepository } from "@/domain/repository/CompanyCredentials.repository";
import { CompanyCredentialsEntity } from "@/domain/entity/CompanyCredentials";
import { CompanyCredentialsDto } from "@/domain/dto/CompanyCredentials";
import { CompanyCredentialsDatasource } from "@/domain/datasource/CompanyCredentials.datasource";

/**
 * Implementación del repositorio de CompanyCredentials
 */
export class CompanyCredentialsRepositoryImpl implements CompanyCredentialsRepository {
  constructor(private readonly datasource: CompanyCredentialsDatasource) {}

  /**
   * Crear o actualizar credenciales (upsert)
   */
  async upsert(dto: CompanyCredentialsDto): Promise<CompanyCredentialsEntity> {
    return await this.datasource.upsert(dto);
  }

  /**
   * Obtener todas las credenciales
   */
  async getAll(): Promise<CompanyCredentialsEntity[]> {
    return await this.datasource.getAll();
  }

  /**
   * Obtener credenciales por RUC
   */
  async getByRuc(ruc: string): Promise<CompanyCredentialsEntity | null> {
    return await this.datasource.getByRuc(ruc);
  }

  /**
   * Obtener credenciales por UUID
   */
  async getByUuid(companyUuid: string): Promise<CompanyCredentialsEntity | null> {
    return await this.datasource.getByUuid(companyUuid);
  }

  /**
   * Obtener credenciales desencriptadas por RUC (para usar en login)
   */
  async getDecryptedByRuc(ruc: string): Promise<CompanyCredentialsDto | null> {
    return await this.datasource.getDecryptedByRuc(ruc);
  }

  /**
   * Actualizar contraseña
   */
  async updatePassword(ruc: string, newPassword: string): Promise<boolean> {
    return await this.datasource.updatePassword(ruc, newPassword);
  }

  /**
   * Eliminar credenciales
   */
  async delete(ruc: string): Promise<boolean> {
    return await this.datasource.delete(ruc);
  }

  /**
   * Contar total de credenciales
   */
  async count(): Promise<number> {
    return await this.datasource.count();
  }
}
