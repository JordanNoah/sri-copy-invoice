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
exports.DownloadInvoicesFromSRIUseCase = void 0;
/**
 * Use Case: Descargar facturas del SRI
 */
class DownloadInvoicesFromSRIUseCase {
    constructor(sriService) {
        this.sriService = sriService;
    }
    execute(fechaInicio, fechaFin) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar que haya sesión activa
            if (!this.sriService.isSessionActive()) {
                return {
                    success: false,
                    message: "No hay sesión activa. Primero debes hacer login.",
                };
            }
            try {
                const downloadPath = yield this.sriService.downloadInvoices(fechaInicio, fechaFin);
                return {
                    success: true,
                    message: "Facturas descargadas exitosamente",
                    downloadPath,
                };
            }
            catch (error) {
                console.error("Error en DownloadInvoicesFromSRIUseCase:", error);
                return {
                    success: false,
                    message: `Error al descargar facturas: ${error instanceof Error ? error.message : "Error desconocido"}`,
                };
            }
        });
    }
}
exports.DownloadInvoicesFromSRIUseCase = DownloadInvoicesFromSRIUseCase;
