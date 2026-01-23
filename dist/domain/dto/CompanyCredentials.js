"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyCredentialsDto = void 0;
/**
 * DTO para crear o actualizar credenciales de empresa
 */
class CompanyCredentialsDto {
    constructor(companyName, ruc, username, password // Password en texto plano (se encripta en el datasource)
    ) {
        this.companyName = companyName;
        this.ruc = ruc;
        this.username = username;
        this.password = password;
    }
}
exports.CompanyCredentialsDto = CompanyCredentialsDto;
