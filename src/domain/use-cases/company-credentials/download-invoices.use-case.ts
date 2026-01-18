import { SRIService } from "@/infrastructure/service/sri.service";
import { CompanyCredentialsRepository } from "@/domain/repository/CompanyCredentials.repository";
import { InvoiceRepository } from "@/domain/repository/Invoice.repository";
import { InvoiceDto } from "@/domain/dto/Invoice";

/**
 * Use case: Descargar facturas del SRI para una empresa
 * 1. Obtener credenciales de la empresa
 * 2. Hacer login en el SRI
 * 3. Descargar facturas con sus documentos (XML/PDF)
 * 4. Guardar en BD y S3
 */
export class DownloadInvoicesUseCase {
  constructor(
    private sriService: SRIService,
    private companyCredentialsRepository: CompanyCredentialsRepository,
    private invoiceRepository: InvoiceRepository
  ) {}

  /**
   * Ejecutar descarga de facturas
   * @param companyRuc RUC de la empresa
   * @param fechaInicio Fecha inicio (opcional)
   * @returns Lista de facturas descargadas
   */
  async execute(companyRuc: string, fechaInicio?: string): Promise<InvoiceDto[]> {
    console.log(`\n📥 Iniciando descarga de facturas para RUC: ${companyRuc}`);

    try {
      // 1. Obtener credenciales de la empresa
      console.log("1️⃣  Obteniendo credenciales de la empresa...");
      const credentials = await this.companyCredentialsRepository.getByRuc(companyRuc);
      
      if (!credentials) {
        throw new Error(
          `No se encontraron credenciales para el RUC: ${companyRuc}`
        );
      }

      // 2. Desencriptar contraseña
      console.log("2️⃣  Desencriptando credenciales...");
      // TODO: Implementar desencriptación si es necesario
      const username = credentials.username;
      const password = credentials.password; // o credentials.decryptedPassword si existe

      // 3. Hacer login en el SRI
      console.log("3️⃣  Iniciando sesión en el SRI...");
      const loginSuccess = await this.sriService.login(
        username,
        password,
        credentials.companyUuid,
        companyRuc
      );

      if (!loginSuccess) {
        throw new Error("Fallo al iniciar sesión en el SRI");
      }

      console.log("✅ Login exitoso en el SRI");

      // 4. Descargar facturas
      console.log("4️⃣  Descargando facturas...");
      const downloadedInvoices = await this.sriService.downloadInvoices(
        fechaInicio || new Date().toISOString().split("T")[0]
      );

      console.log(
        `\n✅ Descarga completada: ${downloadedInvoices.length} facturas procesadas`
      );

      return downloadedInvoices;
    } catch (error) {
      console.error("❌ Error durante la descarga de facturas:", error);
      throw error;
    } finally {
      // Siempre cerrar el navegador
      await this.sriService.close();
    }
  }
}
