import { CompanyCredentialsDatasource } from "@/domain/datasource/CompanyCredentials.datasource";
import { CompanyCredentialsEntity } from "@/domain/entity/CompanyCredentials";
import { CompanyCredentialsDto } from "@/domain/dto/CompanyCredentials";
import { CompanyCredentialsSequelize } from "@/infrastructure/database/models/CompanyCredentials";
import { PasswordUtils } from "@/shared/utils/password.utils";

/**
 * Implementación del datasource de CompanyCredentials usando Sequelize
 */
export class CompanyCredentialsSequelizeDatasource implements CompanyCredentialsDatasource {
  /**
   * Crear o actualizar credenciales (upsert)
   * Usa el RUC como índice para determinar si crear o actualizar
   */
  async upsert(dto: CompanyCredentialsDto): Promise<CompanyCredentialsEntity> {
    // Encriptar la contraseña
    const encryptedPassword = PasswordUtils.encrypt(dto.password);

    // Upsert usando el método nativo de Sequelize
    // Como 'ruc' es único, Sequelize lo usa para determinar si actualizar o crear
    const [record] = await CompanyCredentialsSequelize.upsert({
      companyUuid: crypto.randomUUID(),
      companyName: dto.companyName,
      ruc: dto.ruc,
      username: dto.username,
      password: encryptedPassword,
    });

    return this.mapToEntity(record);
  }

  /**
   * Obtener todas las credenciales
   */
  async getAll(): Promise<CompanyCredentialsEntity[]> {
    const records = await CompanyCredentialsSequelize.findAll({
      order: [["companyName", "ASC"]],
    });

    return records.map((record) => this.mapToEntity(record));
  }

  /**
   * Obtener credenciales por RUC
   */
  async getByRuc(ruc: string): Promise<CompanyCredentialsEntity | null> {
    const record = await CompanyCredentialsSequelize.findOne({
      where: { ruc },
    });

    if (!record) {
      return null;
    }

    return this.mapToEntity(record);
  }

  /**
   * Obtener credenciales por UUID
   */
  async getByUuid(companyUuid: string): Promise<CompanyCredentialsEntity | null> {
    const record = await CompanyCredentialsSequelize.findOne({
      where: { companyUuid },
    });

    if (!record) {
      return null;
    }

    return this.mapToEntity(record);
  }

  /**
   * Obtener credenciales desencriptadas por RUC (para usar en login)
   */
  async getDecryptedByRuc(ruc: string): Promise<CompanyCredentialsDto | null> {
    const record = await CompanyCredentialsSequelize.findOne({
      where: { ruc },
    });

    if (!record) {
      return null;
    }

    // Desencriptar la contraseña
    const decryptedPassword = PasswordUtils.decrypt(record.password);

    return new CompanyCredentialsDto(
      record.companyName,
      record.ruc,
      record.username,
      decryptedPassword
    );
  }

  /**
   * Actualizar contraseña
   */
  async updatePassword(ruc: string, newPassword: string): Promise<boolean> {
    const encryptedPassword = PasswordUtils.encrypt(newPassword);

    const [affectedRows] = await CompanyCredentialsSequelize.update(
      { password: encryptedPassword },
      { where: { ruc } }
    );

    return affectedRows > 0;
  }

  /**
   * Eliminar credenciales
   */
  async delete(ruc: string): Promise<boolean> {
    const affectedRows = await CompanyCredentialsSequelize.destroy({
      where: { ruc },
    });

    return affectedRows > 0;
  }

  /**
   * Contar total de credenciales
   */
  async count(): Promise<number> {
    return await CompanyCredentialsSequelize.count();
  }

  /**
   * Mapear registro de Sequelize a entidad de dominio
   */
  private mapToEntity(record: CompanyCredentialsSequelize): CompanyCredentialsEntity {
    return CompanyCredentialsEntity.fromRow(record);
  }
}
