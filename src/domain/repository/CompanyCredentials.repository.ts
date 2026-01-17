import { CompanyCredentialsEntity } from "../entity/CompanyCredentials";
import { CompanyCredentialsDto } from "../dto/CompanyCredentials";

/**
 * Contrato del repositorio de CompanyCredentials
 */
export interface CompanyCredentialsRepository {
  /**
   * Crear o actualizar credenciales (upsert)
   * Usa el RUC como índice para determinar si crear o actualizar
   */
  upsert(dto: CompanyCredentialsDto): Promise<CompanyCredentialsEntity>;

  /**
   * Obtener todas las credenciales
   */
  getAll(): Promise<CompanyCredentialsEntity[]>;

  /**
   * Obtener credenciales por RUC
   */
  getByRuc(ruc: string): Promise<CompanyCredentialsEntity | null>;

  /**
   * Obtener credenciales por UUID
   */
  getByUuid(companyUuid: string): Promise<CompanyCredentialsEntity | null>;

  /**
   * Obtener credenciales desencriptadas por RUC (para usar en login)
   * Retorna el DTO con la contraseña en texto plano
   */
  getDecryptedByRuc(ruc: string): Promise<CompanyCredentialsDto | null>;

  /**
   * Actualizar contraseña
   */
  updatePassword(ruc: string, newPassword: string): Promise<boolean>;

  /**
   * Eliminar credenciales
   */
  delete(ruc: string): Promise<boolean>;

  /**
   * Contar total de credenciales
   */
  count(): Promise<number>;
}
