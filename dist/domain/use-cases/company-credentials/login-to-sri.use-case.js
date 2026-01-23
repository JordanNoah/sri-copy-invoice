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
exports.LoginToSRIUseCase = void 0;
/**
 * Use Case: Hacer login en el SRI usando credenciales almacenadas
 */
class LoginToSRIUseCase {
    constructor(repository, sriService) {
        this.repository = repository;
        this.sriService = sriService;
    }
    execute(ruc) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Obtener credenciales desencriptadas
            const credentials = yield this.repository.getDecryptedByRuc(ruc);
            if (!credentials) {
                return {
                    success: false,
                    message: `No se encontraron credenciales para el RUC: ${ruc}`,
                };
            }
            // 2. Intentar hacer login en el SRI
            try {
                const loginSuccess = yield this.sriService.login(credentials.username, credentials.password);
                if (loginSuccess) {
                    return {
                        success: true,
                        message: `Login exitoso en el SRI para ${credentials.companyName}`,
                    };
                }
                else {
                    return {
                        success: false,
                        message: "Login fallido. Verifica las credenciales.",
                    };
                }
            }
            catch (error) {
                console.error("Error en LoginToSRIUseCase:", error);
                return {
                    success: false,
                    message: `Error al intentar hacer login: ${error instanceof Error ? error.message : "Error desconocido"}`,
                };
            }
        });
    }
}
exports.LoginToSRIUseCase = LoginToSRIUseCase;
