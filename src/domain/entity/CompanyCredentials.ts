import { CompanyCredentialsSequelize } from "@/infrastructure/database/models/CompanyCredentials";

/**
 * Entidad de dominio para CompanyCredentials
 */
export class CompanyCredentialsEntity {
  constructor(
    public id: number,
    public companyUuid: string,
    public companyName: string,
    public ruc: string,
    public username: string,
    public password: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  /**
   * Crear entidad desde row de base de datos
   */
  public static fromRow(row: CompanyCredentialsSequelize): CompanyCredentialsEntity {
    return new CompanyCredentialsEntity(
      row.id,
      row.companyUuid,
      row.companyName,
      row.ruc,
      row.username,
      row.password,
      row.createdAt,
      row.updatedAt
    );
  }

  /**
   * Obtener información sin contraseña
   */
  public toPublicData(): {
    id: number;
    companyUuid: string;
    companyName: string;
    ruc: string;
    username: string;
  } {
    return {
      id: this.id,
      companyUuid: this.companyUuid,
      companyName: this.companyName,
      ruc: this.ruc,
      username: this.username,
    };
  }
}
