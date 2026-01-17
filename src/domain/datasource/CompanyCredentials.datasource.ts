import { CompanyCredentialsEntity } from "../entity/CompanyCredentials";
import { CompanyCredentialsDto } from "../dto/CompanyCredentials";

/**
 * Contrato del datasource de CompanyCredentials
 */
export abstract class CompanyCredentialsDatasource {
  /**
   * Crear o actualizar credenciales (upsert)
   * Usa el RUC como índice para determinar si crear o actualizar
   */
  abstract upsert(dto: CompanyCredentialsDto): Promise<CompanyCredentialsEntity>;

  /**
   * Obtener todas las credenciales
   */
  abstract getAll(): Promise<CompanyCredentialsEntity[]>;

  /**
   * Obtener credenciales por RUC
   */
  abstract getByRuc(ruc: string): Promise<CompanyCredentialsEntity | null>;

  /**
   * Obtener credenciales por UUID
   */
  abstract getByUuid(companyUuid: string): Promise<CompanyCredentialsEntity | null>;

  /**
   * Obtener credenciales desencriptadas por RUC (para usar en login)
   * Retorna el DTO con la contraseña en texto plano
   */
  abstract getDecryptedByRuc(ruc: string): Promise<CompanyCredentialsDto | null>;

  /**
   * Actualizar contraseña
   */
  abstract updatePassword(ruc: string, newPassword: string): Promise<boolean>;

  /**
   * Eliminar credenciales
   */
  abstract delete(ruc: string): Promise<boolean>;

  /**
   * Contar total de credenciales
   */
  abstract count(): Promise<number>;
}
