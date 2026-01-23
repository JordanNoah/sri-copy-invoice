import { SRIService } from "@/infrastructure/service/sri.service";

/**
 * Use Case: Descargar facturas del SRI
 */
export class DownloadInvoicesFromSRIUseCase {
  constructor(private readonly sriService: SRIService) {}

  async execute(
    fechaInicio: string,
    fechaFin: string
  ): Promise<{
    success: boolean;
    message: string;
    downloadPath?: string;
  }> {
    // Verificar que haya sesión activa
    if (!this.sriService.isSessionActive()) {
      return {
        success: false,
        message: "No hay sesión activa. Primero debes hacer login.",
      };
    }

    try {
      const downloadPath = await this.sriService.downloadInvoices(fechaInicio);

      return {
        success: true,
        message: "Facturas descargadas exitosamente",
      };
    } catch (error) {
      console.error("Error en DownloadInvoicesFromSRIUseCase:", error);
      return {
        success: false,
        message: `Error al descargar facturas: ${error instanceof Error ? error.message : "Error desconocido"}`,
      };
    }
  }
}
