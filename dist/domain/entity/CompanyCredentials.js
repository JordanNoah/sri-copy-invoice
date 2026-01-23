"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyCredentialsEntity = void 0;
/**
 * Entidad de dominio para CompanyCredentials
 */
class CompanyCredentialsEntity {
    constructor(id, companyUuid, companyName, ruc, username, password, createdAt, updatedAt) {
        this.id = id;
        this.companyUuid = companyUuid;
        this.companyName = companyName;
        this.ruc = ruc;
        this.username = username;
        this.password = password;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    /**
     * Crear entidad desde row de base de datos
     */
    static fromRow(row) {
        return new CompanyCredentialsEntity(row.id, row.companyUuid, row.companyName, row.ruc, row.username, row.password, row.createdAt, row.updatedAt);
    }
    /**
     * Obtener información sin contraseña
     */
    toPublicData() {
        return {
            id: this.id,
            companyUuid: this.companyUuid,
            companyName: this.companyName,
            ruc: this.ruc,
            username: this.username,
        };
    }
}
exports.CompanyCredentialsEntity = CompanyCredentialsEntity;
