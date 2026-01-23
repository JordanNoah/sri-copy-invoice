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
exports.CompanyCredentialsSequelizeDatasource = void 0;
const CompanyCredentials_1 = require("@/domain/entity/CompanyCredentials");
const CompanyCredentials_2 = require("@/domain/dto/CompanyCredentials");
const CompanyCredentials_3 = require("@/infrastructure/database/models/CompanyCredentials");
const password_utils_1 = require("@/shared/utils/password.utils");
/**
 * Implementación del datasource de CompanyCredentials usando Sequelize
 */
class CompanyCredentialsSequelizeDatasource {
    /**
     * Crear o actualizar credenciales (upsert)
     * Usa el RUC como índice para determinar si crear o actualizar
     */
    upsert(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            // Encriptar la contraseña
            const encryptedPassword = password_utils_1.PasswordUtils.encrypt(dto.password);
            // Upsert usando el método nativo de Sequelize
            // Como 'ruc' es único, Sequelize lo usa para determinar si actualizar o crear
            const [record] = yield CompanyCredentials_3.CompanyCredentialsSequelize.upsert({
                companyUuid: crypto.randomUUID(),
                companyName: dto.companyName,
                ruc: dto.ruc,
                username: dto.username,
                password: encryptedPassword,
            });
            return this.mapToEntity(record);
        });
    }
    /**
     * Obtener todas las credenciales
     */
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield CompanyCredentials_3.CompanyCredentialsSequelize.findAll({
                order: [["companyName", "ASC"]],
            });
            return records.map((record) => this.mapToEntity(record));
        });
    }
    /**
     * Obtener credenciales por RUC
     */
    getByRuc(ruc) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield CompanyCredentials_3.CompanyCredentialsSequelize.findOne({
                where: { ruc },
            });
            if (!record) {
                return null;
            }
            return this.mapToEntity(record);
        });
    }
    /**
     * Obtener credenciales por UUID
     */
    getByUuid(companyUuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield CompanyCredentials_3.CompanyCredentialsSequelize.findOne({
                where: { companyUuid },
            });
            if (!record) {
                return null;
            }
            return this.mapToEntity(record);
        });
    }
    /**
     * Obtener credenciales desencriptadas por RUC (para usar en login)
     */
    getDecryptedByRuc(ruc) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield CompanyCredentials_3.CompanyCredentialsSequelize.findOne({
                where: { ruc },
            });
            if (!record) {
                return null;
            }
            // Desencriptar la contraseña
            const decryptedPassword = password_utils_1.PasswordUtils.decrypt(record.password);
            return new CompanyCredentials_2.CompanyCredentialsDto(record.companyName, record.ruc, record.username, decryptedPassword);
        });
    }
    /**
     * Actualizar contraseña
     */
    updatePassword(ruc, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const encryptedPassword = password_utils_1.PasswordUtils.encrypt(newPassword);
            const [affectedRows] = yield CompanyCredentials_3.CompanyCredentialsSequelize.update({ password: encryptedPassword }, { where: { ruc } });
            return affectedRows > 0;
        });
    }
    /**
     * Eliminar credenciales
     */
    delete(ruc) {
        return __awaiter(this, void 0, void 0, function* () {
            const affectedRows = yield CompanyCredentials_3.CompanyCredentialsSequelize.destroy({
                where: { ruc },
            });
            return affectedRows > 0;
        });
    }
    /**
     * Contar total de credenciales
     */
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield CompanyCredentials_3.CompanyCredentialsSequelize.count();
        });
    }
    /**
     * Mapear registro de Sequelize a entidad de dominio
     */
    mapToEntity(record) {
        return CompanyCredentials_1.CompanyCredentialsEntity.fromRow(record);
    }
}
exports.CompanyCredentialsSequelizeDatasource = CompanyCredentialsSequelizeDatasource;
