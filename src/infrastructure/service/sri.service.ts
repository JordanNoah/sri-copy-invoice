import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser, Page } from "puppeteer";
import { FileService } from "@/infrastructure/service/file.service";
import { InvoiceRepository } from "@/domain/repository/Invoice.repository";
import { InvoiceDocumentRepository } from "@/domain/repository/InvoiceDocument.repository";
import { InvoiceDto } from "@/domain/dto/Invoice";
import { InvoiceDocumentDto } from "@/domain/dto/InvoiceDocument";

// Aplicar stealth plugin
puppeteer.use(StealthPlugin());

/**
 * Servicio para interactuar con el portal del SRI
 * Automatiza el login y descarga de archivos usando Puppeteer
 */
export class SRIService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private companyUuid: string = "";
  private companyRuc: string = "";

  // URLs del SRI
  private readonly SRI_LOGIN_URL = "https://srienlinea.sri.gob.ec/sri-en-linea/inicio/NAT";
  private readonly SRI_HOME_URL = "https://srienlinea.sri.gob.ec/";

  constructor(
    private fileService: FileService,
    private invoiceRepository: InvoiceRepository,
    private invoiceDocumentRepository: InvoiceDocumentRepository
  ) {}

  /**
   * Inicializar el navegador
   */
  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: false, // Cambia a true en producción
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      });

      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1366, height: 768 });

      // Configurar timeout por defecto
      this.page.setDefaultTimeout(60000); // 60 segundos
    }
  }

  /**
   * Hacer login en el SRI
   * @param username Usuario (RUC o cédula)
   * @param password Contraseña
   * @param companyUuid UUID de la empresa
   * @param companyRuc RUC de la empresa
   * @returns true si el login fue exitoso
   */
  async login(
    username: string,
    password: string,
    companyUuid: string,
    companyRuc: string
  ): Promise<boolean> {
    try {
      this.companyUuid = companyUuid;
      this.companyRuc = companyRuc;

      await this.initBrowser();

      if (!this.page) {
        throw new Error("No se pudo inicializar el navegador");
      }

      console.log("Navegando a la página de login del SRI...");
      await this.page.goto(this.SRI_LOGIN_URL, {
        waitUntil: "networkidle2",
      });

      console.log("Esperando formulario de login...");
      
      // Hacer clic en el botón "Iniciar sesión"
      console.log("Haciendo clic en el botón de iniciar sesión...");
      await this.page.click('a.sri-tamano-link-iniciar-sesion[href="/sri-en-linea/contribuyente/perfil"]');
      
      // Esperar a que se cargue la página de login
      await this.page.waitForNavigation({ waitUntil: "networkidle2" });

      // Ingresar usuario
      await this.page.type('input[name="usuario"]', username, { delay: 100 });

      // Ingresar contraseña
      await this.page.type('input[name="password"]', password, { delay: 100 });

      // Hacer clic en el botón de login
      console.log("Haciendo clic en el botón de ingresar...");
      await this.page.click('#kc-login');

      await this.delay(5000); // Esperar a que cargue la página
      
      // Hacer clic en el botón de expandir menú
      console.log("Haciendo clic en el botón de expandir menú...");
      await this.page.click('#sri-menu');
      
      await this.delay(1000); // Esperar a que se expanda el menú
      
      // Hacer clic en el menú de Facturación Electrónica
      console.log("Haciendo clic en el menú de Facturación Electrónica...");
      // Usar evaluate para encontrar y hacer clic en el elemento por texto
      await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a.ui-panelmenu-header-link'));
        const facturacionLink = links.find(link => 
          link.textContent.includes('FACTURACIÓN ELECTRÓNICA')
        );
        if (facturacionLink) {
          (facturacionLink as HTMLElement).click();
        }
      });
      
      await this.delay(1500); // Esperar a que se expanda el menú
      
      // Hacer clic en "Comprobantes electrónicos recibidos"
      console.log("Haciendo clic en Comprobantes electrónicos recibidos...");
      await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a.ui-menuitem-link'));
        const comprobantesLink = links.find(link => 
          link.textContent.includes('Comprobantes electrónicos recibidos')
        );
        if (comprobantesLink) {
          (comprobantesLink as HTMLElement).click();
        }
      });
      
      return true;
    } catch (error) {
      console.error("Error durante el login al SRI:", error);
      throw error;
    }
  }

  /**
   * Descargar comprobantes electrónicos
   * Scrapes los datos de la tabla, descarga XML/PDF y guarda en BD + S3
   * @param fechaInicio Fecha de inicio para la búsqueda
   * @returns Array de objetos con información de las facturas descargadas
   */
  async downloadInvoices(fechaInicio: string): Promise<InvoiceDto[]> {
    try {
      if (!this.page) {
        throw new Error("No hay sesión activa. Primero debes hacer login.");
      }

      if (!this.companyUuid || !this.companyRuc) {
        throw new Error("Los datos de la empresa (UUID/RUC) no están disponibles");
      }

      console.log(`Descargando facturas desde ${fechaInicio}...`);

      // Seleccionar "Todos" en el combo de día
      console.log("Seleccionando 'Todos' en el combo de día...");
      await this.delay(2000);
      await this.page.select('#frmPrincipal\\:dia', '0');
      await this.delay(1000);

      // Simulación de comportamiento humano
      console.log("Simulando comportamiento humano...");
      await this.page.evaluate(() => {
        window.scrollBy(0, 100);
      });
      await this.delay(this.randomDelay(600, 1000));

      // Hacer clic en el botón de búsqueda con reintentos si hay captcha
      console.log("Haciendo clic en el botón Consultar...");
      await this.clickWithCaptchaRetry('#frmPrincipal\\:btnBuscar');

      await this.delay(200000);

      // Esperar a que cargue la tabla de resultados
      console.log("Esperando que se cargue la tabla de resultados...");
      await this.page.waitForSelector(
        'table[role="grid"]',
        { timeout: 30000 }
      ).catch(() => {
        console.warn("Tabla de resultados no encontrada (puede estar vacía)");
      });

      await this.delay(2000); // Esperar a que se carguen completamente los datos

      // Scraping de datos de la tabla
      console.log("Extrayendo datos de facturas...");
      const invoiceRows = await this.page.evaluate(() => {
        const rows: Array<{
          invoiceNumber: string;
          ruc: string;
          amount: string;
          date: string;
          rowIndex: number;
        }> = [];

        const tableRows = document.querySelectorAll('table[role="grid"] tbody tr');
        tableRows.forEach((row, index) => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 4) {
            rows.push({
              invoiceNumber: cells[1]?.textContent?.trim() || '',
              ruc: cells[2]?.textContent?.trim() || '',
              amount: cells[3]?.textContent?.trim() || '',
              date: cells[0]?.textContent?.trim() || '',
              rowIndex: index,
            });
          }
        });

        return rows;
      });

      console.log(`Se encontraron ${invoiceRows.length} facturas`);

      const downloadedInvoices: InvoiceDto[] = [];

      // Descargar cada factura
      for (let i = 0; i < invoiceRows.length; i++) {
        const row = invoiceRows[i];
        console.log(
          `\n[${i + 1}/${invoiceRows.length}] Procesando factura: ${row.invoiceNumber}`
        );

        try {
          // Hacer clic en la fila para expandir y mostrar opciones de descarga
          await this.page.evaluate((rowIndex) => {
            const rows = document.querySelectorAll('table[role="grid"] tbody tr');
            if (rows[rowIndex]) {
              (rows[rowIndex] as HTMLElement).click();
            }
          }, row.rowIndex);

          await this.delay(this.randomDelay(1000, 2000));

          // Extraer URLs de descargas de XML y PDF
          const downloadUrls = await this.page.evaluate(() => {
            const links: { xml?: string; pdf?: string } = {};
            const downloadLinks = document.querySelectorAll('a[onclick*="descargarArchivo"]');

            downloadLinks.forEach((link) => {
              const href = link.getAttribute('href');
              const text = link.textContent?.toLowerCase() || '';

              if (text.includes('xml') || href?.includes('xml')) {
                links.xml = href || undefined;
              } else if (text.includes('pdf') || href?.includes('pdf')) {
                links.pdf = href || undefined;
              }
            });

            return links;
          });

          // Crear registro de invoice en BD
          const invoiceData: InvoiceDto = {
            invoiceUuid: this.generateUUID(),
            companyUuid: this.companyUuid,
            invoiceNumber: row.invoiceNumber,
            invoiceDate: new Date(row.date),
            amount: parseFloat(row.amount.replace(/[^\d.-]/g, '')) || 0,
            description: `Factura de ${row.ruc}`,
          };

          const createdInvoice = await this.invoiceRepository.create(invoiceData);
          console.log(`✓ Factura guardada en BD: ${createdInvoice.invoiceUuid}`);

          // Descargar y guardar archivos
          const documents: InvoiceDocumentDto[] = [];

          // Descargar XML
          if (downloadUrls.xml) {
            try {
              console.log("  ↓ Descargando XML...");
              const xmlBuffer = await this.downloadFile(downloadUrls.xml);
              const xmlFileName = `${row.invoiceNumber}.xml`;
              const xmlS3Key = await this.fileService.saveFile(
                xmlBuffer,
                xmlFileName,
                this.companyRuc
              );

              const xmlDoc: InvoiceDocumentDto = {
                documentUuid: this.generateUUID(),
                invoiceUuid: invoiceData.invoiceUuid,
                fileName: xmlFileName,
                s3Key: xmlS3Key,
                s3Url: this.fileService.getFileUrl(xmlS3Key),
                fileType: 'xml',
                fileSize: xmlBuffer.length,
                uploadDate: new Date(),
              };

              await this.invoiceDocumentRepository.create(xmlDoc);
              documents.push(xmlDoc);
              console.log(`  ✓ XML guardado: ${xmlS3Key}`);
            } catch (error) {
              console.error(`  ✗ Error descargando XML:`, error);
            }
          }

          // Descargar PDF
          if (downloadUrls.pdf) {
            try {
              console.log("  ↓ Descargando PDF...");
              const pdfBuffer = await this.downloadFile(downloadUrls.pdf);
              const pdfFileName = `${row.invoiceNumber}.pdf`;
              const pdfS3Key = await this.fileService.saveFile(
                pdfBuffer,
                pdfFileName,
                this.companyRuc
              );

              const pdfDoc: InvoiceDocumentDto = {
                documentUuid: this.generateUUID(),
                invoiceUuid: invoiceData.invoiceUuid,
                fileName: pdfFileName,
                s3Key: pdfS3Key,
                s3Url: this.fileService.getFileUrl(pdfS3Key),
                fileType: 'pdf',
                fileSize: pdfBuffer.length,
                uploadDate: new Date(),
              };

              await this.invoiceDocumentRepository.create(pdfDoc);
              documents.push(pdfDoc);
              console.log(`  ✓ PDF guardado: ${pdfS3Key}`);
            } catch (error) {
              console.error(`  ✗ Error descargando PDF:`, error);
            }
          }

          downloadedInvoices.push(invoiceData);

          // Comportamiento humano entre descargas
          await this.delay(this.randomDelay(1500, 3000));
        } catch (error) {
          console.error(`✗ Error procesando factura ${row.invoiceNumber}:`, error);
          continue; // Continuar con la siguiente factura
        }
      }

      console.log(`\n✅ Descarga completada: ${downloadedInvoices.length} facturas procesadas`);
      return downloadedInvoices;
    } catch (error) {
      console.error("Error al descargar facturas:", error);
      throw error;
    }
  }

  /**
   * Descargar archivo como buffer
   */
  private async downloadFile(url: string): Promise<Buffer> {
    if (!this.page) {
      throw new Error("No hay página activa");
    }

    try {
      const response = await this.page.goto(url, {
        waitUntil: 'networkidle0',
      });

      if (!response) {
        throw new Error('No se pudo obtener respuesta del servidor');
      }

      return await response.buffer();
    } catch (error) {
      throw new Error(`Error descargando archivo: ${error}`);
    }
  }

  /**
   * Generar UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Cerrar el navegador
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      console.log("Navegador cerrado");
    }
  }

  /**
   * Obtener screenshot de la página actual (útil para debugging)
   */
  async screenshot(path: string): Promise<void> {
    if (this.page) {
      await this.page.screenshot({ path, fullPage: true });
      console.log(`Screenshot guardado en: ${path}`);
    }
  }

  /**
   * Verificar si hay sesión activa
   */
  isSessionActive(): boolean {
    return this.browser !== null && this.page !== null;
  }

  /**
   * Helper para delay (reemplazo de waitForTimeout)
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generar un delay aleatorio entre min y max ms
   */
  private randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Hacer clic en un botón y reintentar si aparece error de captcha
   * Con comportamiento humano mejorado y más reintentos
   */
  private async clickWithCaptchaRetry(
    selector: string,
    maxRetries: number = 20
  ): Promise<void> {
    let retries = 0;
    let captchaError = false;

    do {
      captchaError = false;
      const attemptNumber = retries + 1;
      console.log(`🔄 Intento ${attemptNumber} de ${maxRetries}...`);
      
      // Comportamiento humano: scrolling suave antes del clic
      await this.simulateHumanScrolling();
      
      // Esperar un poco para "leer" el formulario
      await this.delay(this.randomDelay(500, 1200));
      
      // Mover mouse lentamente hacia el botón
      await this.moveMouseToButton(selector);
      
      // Esperar un poco antes de hacer clic (simulando decisión)
      await this.delay(this.randomDelay(300, 700));
      
      // Hacer clic
      await this.page?.click(selector);
      
      // Esperar a que se procese la búsqueda (más tiempo en intentos posteriores)
      const baseWait = 3000 + attemptNumber * 500; // Aumenta conforme avanzan intentos
      const processWait = this.randomDelay(baseWait, baseWait + 2000);
      console.log(`⏳ Esperando ${processWait}ms para procesamiento...`);
      await this.delay(processWait);
      
      // Revisar si aparece el mensaje de captcha incorrecto
      const captchaErrorElement = await this.page?.evaluate(() => {
        const messages = document.getElementById('formMessages:messages');
        if (messages) {
          const errorText = messages.textContent;
          return errorText && errorText.includes('Captcha incorrecta');
        }
        return false;
      });
      
      if (captchaErrorElement) {
        captchaError = true;
        retries++;
        
        const percentComplete = Math.round((attemptNumber / maxRetries) * 100);
        console.warn(
          `⚠️ Captcha incorrecta en intento ${attemptNumber}. Reintentando... [${percentComplete}%]`
        );
        
        // Cerrar el mensaje de error
        await this.page?.evaluate(() => {
          const closeButton = document.querySelector(
            '#formMessages\\:messages .ui-messages-close'
          );
          if (closeButton) {
            (closeButton as HTMLElement).click();
          }
        });
        
        // Esperar un poco después de cerrar el mensaje
        await this.delay(this.randomDelay(800, 1500));
        
        // Refrescar el captcha (si es posible)
        await this.page?.evaluate(() => {
          const refreshButton = document.querySelector('[aria-label="Recargar captcha"]');
          if (refreshButton) {
            (refreshButton as HTMLElement).click();
          }
        });
        
        // Esperar a que se recargue el captcha
        await this.delay(this.randomDelay(1500, 2500));
        
        // Comportamiento humano después de error: frustración simulada
        if (attemptNumber % 3 === 0) {
          // Cada 3 intentos, esperar un poco más (simular pausa para "revisar")
          console.log("🤔 Revisando formulario nuevamente...");
          await this.simulateHumanScrolling();
          await this.delay(this.randomDelay(2000, 3000));
        } else if (attemptNumber % 5 === 0) {
          // Cada 5 intentos, hacer scroll al inicio y esperar
          console.log("📜 Scroll completo del formulario...");
          await this.page?.evaluate(() => {
            window.scrollTo(0, 0);
          });
          await this.delay(this.randomDelay(1000, 2000));
        }
        
        // Simular comportamiento humano: mover mouse aleatoriamente
        await this.simulateRandomMouseMovement();
        
        // Esperar antes del próximo intento (más tiempo conforme avanzan intentos)
        const waitBeforeNext = 1000 + attemptNumber * 200;
        await this.delay(this.randomDelay(waitBeforeNext, waitBeforeNext + 800));
      } else {
        console.log("✅ Búsqueda exitosa, sin errores de captcha");
      }
    } while (captchaError && retries < maxRetries);

    if (captchaError && retries >= maxRetries) {
      throw new Error(
        `Falló después de ${maxRetries} intentos. El captcha sigue siendo incorrecto. Intenta nuevamente más tarde.`
      );
    }
  }

  /**
   * Simular scrolling humano en la página
   */
  private async simulateHumanScrolling(): Promise<void> {
    if (!this.page) return;

    const scrolls = [
      { direction: "down", amount: this.randomDelay(100, 200) },
      { direction: "up", amount: this.randomDelay(50, 100) },
      { direction: "down", amount: this.randomDelay(100, 150) },
    ];

    for (const scroll of scrolls) {
      const direction = scroll.direction === "down" ? 1 : -1;
      await this.page.evaluate((amount, dir) => {
        window.scrollBy(0, amount * dir);
      }, scroll.amount, direction);
      await this.delay(this.randomDelay(200, 400));
    }
  }

  /**
   * Mover mouse lentamente hacia un botón
   */
  private async moveMouseToButton(selector: string): Promise<void> {
    if (!this.page) return;

    const button = await this.page.$(selector);
    if (!button) return;

    const boundingBox = await button.boundingBox();
    if (!boundingBox) return;

    // Generar posición inicial aleatoria
    const startX = this.randomDelay(100, 300);
    const startY = this.randomDelay(100, 300);
    const endX = boundingBox.x + boundingBox.width / 2;
    const endY = boundingBox.y + boundingBox.height / 2;

    // Mover mouse lentamente hacia el botón con paradas intermedias
    const steps = 15;
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;
      
      await this.page.mouse.move(x, y);
      await this.delay(this.randomDelay(30, 80));

      // Simular pequeñas pausas/temblores humanos
      if (i % 5 === 0 && i > 0) {
        await this.delay(this.randomDelay(50, 150));
      }
    }

    // Hover sobre el botón
    await this.delay(this.randomDelay(200, 500));
  }

  /**
   * Simular movimientos aleatorios del mouse
   */
  private async simulateRandomMouseMovement(): Promise<void> {
    if (!this.page) return;

    const movements = this.randomDelay(2, 4);
    for (let i = 0; i < movements; i++) {
      const x = this.randomDelay(200, 1000);
      const y = this.randomDelay(200, 600);
      await this.page.mouse.move(x, y);
      await this.delay(this.randomDelay(100, 300));
    }
  }
}
