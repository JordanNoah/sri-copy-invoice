"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyCredentialsRepositoryImpl = void 0;
/**
 * Implementación del repositorio de CompanyCredentials
 */
class CompanyCredentialsRepositoryImpl {
    constructor(datasource) {
        this.datasource = datasource;
    }
    /**
     * Crear o actualizar credenciales (upsert)
     */
    upsert(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.datasource.upsert(dto);
        });
    }
    /**
     * Obtener todas las credenciales
     */
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.datasource.getAll();
        });
    }
    /**
     * Obtener credenciales por RUC
     */
    getByRuc(ruc) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.datasource.getByRuc(ruc);
        });
    }
    /**
     * Obtener credenciales por UUID
     */
    getByUuid(companyUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.datasource.getByUuid(companyUuid);
        });
    }
    /**
     * Obtener credenciales desencriptadas por RUC (para usar en login)
     */
    getDecryptedByRuc(ruc) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.datasource.getDecryptedByRuc(ruc);
        });
    }
    /**
     * Actualizar contraseña
     */
    updatePassword(ruc, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.datasource.updatePassword(ruc, newPassword);
        });
    }
    /**
     * Eliminar credenciales
     */
    delete(ruc) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.datasource.delete(ruc);
        });
    }
    /**
     * Contar total de credenciales
     */
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.datasource.count();
        });
    }
}
exports.CompanyCredentialsRepositoryImpl = CompanyCredentialsRepositoryImpl;
