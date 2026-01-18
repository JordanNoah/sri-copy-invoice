import { SRIService } from "@/infrastructure/service/sri.service";
import { CompanyCredentialsSequelizeDatasource } from "@/infrastructure/datasource/CompanyCredentialDatasource.impl";
import { CompanyCredentialsRepositoryImpl } from "@/infrastructure/repository/CompanyCredentials.repository.impl";
import { InvoiceSequelizeDatasource } from "@/infrastructure/datasource/InvoiceSequelizeDatasource.impl";
import { InvoiceRepositoryImpl } from "@/infrastructure/repository/Invoice.repository.impl";
import { InvoiceDocumentSequelizeDatasource } from "@/infrastructure/datasource/InvoiceDocumentSequelizeDatasource.impl";
import { InvoiceDocumentRepositoryImpl } from "@/infrastructure/repository/InvoiceDocument.repository.impl";
import { FileService } from "@/infrastructure/service/file.service";

/**
 * Función automatizada para hacer login en el SRI y descargar facturas
 * Se ejecuta al iniciar el servidor para debugging
 */
export async function sriAutomatedLogin() {
  console.log("\n========================================");
  console.log("🤖 Iniciando proceso automatizado del SRI");
  console.log("========================================\n");

  // Inicializar servicios y repositorios
  const invoiceDatasource = new InvoiceSequelizeDatasource();
  const invoiceRepository = new InvoiceRepositoryImpl(invoiceDatasource);
  const invoiceDocumentDatasource = new InvoiceDocumentSequelizeDatasource();
  const invoiceDocumentRepository = new InvoiceDocumentRepositoryImpl(invoiceDocumentDatasource);
  const fileService = new FileService();

  const sriService = new SRIService(fileService, invoiceRepository, invoiceDocumentRepository);
  const datasource = new CompanyCredentialsSequelizeDatasource();
  const repository = new CompanyCredentialsRepositoryImpl(datasource);

  try {
    // 1. Obtener todas las credenciales
    console.log("📋 Obteniendo credenciales guardadas...");
    const allCredentials = await repository.getAll();

    if (allCredentials.length === 0) {
      console.log("⚠️  No hay credenciales guardadas. Proceso finalizado.");
      return;
    }

    console.log(`✅ Se encontraron ${allCredentials.length} empresa(s)\n`);

    // 2. Procesar cada empresa
    for (const credential of allCredentials) {
      console.log(`\n--- Procesando: ${credential.companyName} (${credential.ruc}) ---`);

      // Obtener credenciales desencriptadas
      const decryptedCreds = await repository.getDecryptedByRuc(credential.ruc);

      if (!decryptedCreds) {
        console.log(`❌ No se pudieron obtener credenciales para ${credential.ruc}`);
        continue;
      }

      // Hacer login
      console.log(`🔐 Iniciando sesión en el SRI...`);
      const loginSuccess = await sriService.login(
        decryptedCreds.username,
        decryptedCreds.password,
        credential.companyUuid,
        credential.ruc
      );

      if (!loginSuccess) {
        console.log(`❌ Login fallido para ${credential.companyName}`);
        console.log(`   Verifica las credenciales en la base de datos\n`);
        await sriService.close();
        continue;
      }

      console.log(`✅ Login exitoso para ${credential.companyName}`);

      // Descargar facturas (últimos 30 días por defecto)
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const fechaInicio = formatDate(thirtyDaysAgo);
      const fechaFin = formatDate(today);

      console.log(`📥 Descargando facturas desde ${fechaInicio} hasta ${fechaFin}...`);

      try {
        const downloadedInvoices = await sriService.downloadInvoices(fechaInicio);
        console.log(`✅ Facturas descargadas: ${downloadedInvoices.length}`);
      } catch (downloadError) {
        console.error(`❌ Error al descargar facturas:`, downloadError);
      }

      // Cerrar navegador para esta empresa
      await sriService.close();
      console.log(`🔒 Sesión cerrada para ${credential.companyName}`);
    }

    console.log("\n========================================");
    console.log("✅ Proceso automatizado completado");
    console.log("========================================\n");
  } catch (error) {
    console.error("\n❌ Error en el proceso automatizado del SRI:", error);
    await sriService.close();
  }
}

/**
 * Formatear fecha a formato DD/MM/YYYY
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
