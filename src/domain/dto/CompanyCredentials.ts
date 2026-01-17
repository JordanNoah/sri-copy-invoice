/**
 * DTO para crear o actualizar credenciales de empresa
 */
export class CompanyCredentialsDto {
  constructor(
    public companyName: string,
    public ruc: string,
    public username: string,
    public password: string // Password en texto plano (se encripta en el datasource)
  ) {}
}
