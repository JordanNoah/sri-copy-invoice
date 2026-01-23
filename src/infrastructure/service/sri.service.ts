import { connect } from 'puppeteer-real-browser';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import crypto from 'crypto';
import { InvoiceDatasourceImpl } from '../datasource/InvoiceDatasource.impl';
import { InvoiceDocumentSequelizeDatasource } from '../datasource/InvoiceDocumentDatasource.impl';
import { FileService } from './file.service';
import { Page } from 'puppeteer';
import { A } from 'vitest/dist/chunks/environment.d.cL3nLXbE';

interface SRIDownloadConfig {
  ruc: string;
  password: string;
  descargasDir: string;
}

interface InvoiceRecord {
  numero: number;
  rucEmisor: string;
  razonSocial: string;
  tipoComprobante: string;
  serieComprobante: string;
  numeroComprobante: string;
  claveAcceso: string;
  fechaAutorizacion: string;
  horaAutorizacion: string;
  fechaEmision: string;
  valorSinImpuestos: number;
  iva: number;
  importeTotal: number;
  xmlLink: string | null;
  pdfLink: string | null;
  documentosRelacionados: string | null;
  rowIndex: number;
  xmlButtonId?: string;
  xmlButtonName?: string;
  xmlButtonOnclick?: string;
  pdfButtonId?: string;
  pdfButtonName?: string;
  pdfButtonOnclick?: string;
}

interface DocumentStatus {
  existe: boolean;
  tieneXml: boolean;
  tienePdf: boolean;
  xmlPath?: string;
  pdfPath?: string;
}

export class SRIService {
  private readonly sriUrl = 'https://srienlinea.sri.gob.ec/sri-en-linea/';
  private readonly screenshotsDir: string;
  private readonly invoiceDatasource: InvoiceDatasourceImpl;
  private readonly invoiceDocumentDatasource: InvoiceDocumentSequelizeDatasource;
  private readonly fileService: FileService;
  private user: string;
  private browser: any = null;
  private page: any = null;

  constructor(user: string) {
    this.user = user;
    this.screenshotsDir = path.join(process.cwd(), 'screenshots');
    this.invoiceDatasource = new InvoiceDatasourceImpl();
    this.invoiceDocumentDatasource = new InvoiceDocumentSequelizeDatasource();
    this.fileService = new FileService();
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async randomDelay(min: number = 500, max: number = 1500): Promise<void> {
    const ms = Math.random() * (max - min) + min;
    await this.delay(ms);
  }

  private async humanType(page: any, selector: string, text: string): Promise<void> {
    await page.focus(selector);
    await this.delay(200);
    for (const char of text) {
      await page.type(selector, char, { delay: Math.random() * 100 + 50 });
      await this.delay(Math.random() * 50 + 30);
    }
  }

  private async humanClick(page: any, selector: string): Promise<void> {
    await page.hover(selector);
    await this.delay(Math.random() * 300 + 100);
    await page.click(selector);
    await this.delay(Math.random() * 500 + 200);
  }

  private async takeScreenshot(page: any, name: string): Promise<void> {
    try {
      await fs.mkdir(this.screenshotsDir, { recursive: true });
      const filePath = path.join(this.screenshotsDir, `${name}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`${name}.png`);
    } catch (error) {
      console.log(`Error taking screenshot ${name}:`, error);
    }
  }

  private async extractInvoicesFromTable(page: any): Promise<InvoiceRecord[]> {
    const invoices = await page.evaluate(() => {
      const tbody = document.getElementById('frmPrincipal:tablaCompRecibidos_data');
      if (!tbody) {
        console.log('tbody no encontrado');
        return [];
      }
      const rows = tbody.querySelectorAll('tr[data-ri]');
      console.log("rows encontradas: ", rows.length);
      
      return Array.from(rows).map((row, index) => {
        const cells = row.querySelectorAll('td');
        
        // Extraer texto de cada celda
        const numero = parseInt(cells[0]?.innerText || '0');
        const rucEmisor = cells[1]?.innerText?.split('\n')[0]?.trim() || '';
        const razonSocial = cells[1]?.innerText?.split('\n')[1]?.trim() || '';
        const comprobante = cells[2]?.innerText || '';
        const claveAcceso = cells[3]?.innerText?.trim() || '';
        const fechaHora = cells[4]?.innerText || '';
        const fechaEmision = cells[5]?.innerText || '';
        const valorSinImpuestos = parseFloat(cells[6]?.innerText || '0');
        const iva = parseFloat(cells[7]?.innerText || '0');
        const importeTotal = parseFloat(cells[8]?.innerText || '0');
        
        // Extraer IDs de los botones XML y PDF
        const xmlButtonElement = cells[9]?.querySelector('a');
        const pdfButtonElement = cells[10]?.querySelector('a');
        
        const xmlButtonId = xmlButtonElement?.id || '';
        const pdfButtonId = pdfButtonElement?.id || '';
        
        console.log(`Fila ${index}: XML=${xmlButtonId}, PDF=${pdfButtonId}`);
        
        return {
          numero,
          rucEmisor,
          razonSocial,
          tipoComprobante: comprobante.split(/\s+/)[0],
          serieComprobante: comprobante.match(/(\d+-\d+-\d+)/)?.[1] || '',
          numeroComprobante: comprobante.match(/(\d+)$/)?.[1] || '',
          claveAcceso,
          fechaAutorizacion: fechaHora.split(' ')[0],
          horaAutorizacion: fechaHora.split(' ')[1],
          fechaEmision,
          valorSinImpuestos,
          iva,
          importeTotal,
          xmlLink: xmlButtonId || null,
          pdfLink: pdfButtonId || null,
          documentosRelacionados: null,
          rowIndex: index,
          xmlButtonId,
          pdfButtonId
        };
      });
    });
    
    return invoices;
  }

  private async checkInvoiceInDatabase(invoice: InvoiceRecord): Promise<DocumentStatus> {
    try {
      console.log(`   Verificando en BD: ${invoice.claveAcceso}`);
      
      // Si no hay datasources, retornar que no existe
      if (!this.invoiceDatasource || !this.invoiceDocumentDatasource) {
        console.log(`   Sin datasources configurados`);
        return {
          existe: false,
          tieneXml: false,
          tienePdf: false,
        };
      }
      
      // 1. Buscar factura por número de factura (serie-numero)
      const numeroFactura = `${invoice.serieComprobante}-${invoice.numeroComprobante}`;
      console.log(`   Buscando factura: ${numeroFactura}`);
      const facturaEnBD = await this.invoiceDatasource.getByInvoiceNumber(numeroFactura);
      
      if (!facturaEnBD) {
        console.log(`   Factura NO existe en BD`);
        return {
          existe: false,
          tieneXml: false,
          tienePdf: false,
        };
      }
      
      console.log(`   Factura existe en BD`);
      
      // 2. Verificar si existen los documentos (XML y PDF)
      const xmlDoc = await this.invoiceDocumentDatasource.getByInvoiceUuidAndFileType(
        facturaEnBD.invoiceUuid,
        'xml'
      );
      
      const pdfDoc = await this.invoiceDocumentDatasource.getByInvoiceUuidAndFileType(
        facturaEnBD.invoiceUuid,
        'pdf'
      );
      
      const tieneXml = !!xmlDoc;
      const tienePdf = !!pdfDoc;
      
      if (tieneXml) console.log(`   XML descargado`);
      if (tienePdf) console.log(`   PDF descargado`);
      
      return {
        existe: true,
        tieneXml,
        tienePdf,
        xmlPath: xmlDoc?.s3Key,
        pdfPath: pdfDoc?.s3Key,
      };
    } catch (error) {
      console.log(`   Error verificando en BD:`, (error as Error).message);
      return {
        existe: false,
        tieneXml: false,
        tienePdf: false,
      };
    }
  }

  private async downloadFile(
    page: any,
    invoice: InvoiceRecord,
    fileType: 'xml' | 'pdf',
    downloadDir: string
  ): Promise<{ buffer: Buffer; s3Key: string } | null> {
    try {
      console.log("invoice", invoice);
      
      const filename = `${invoice.claveAcceso}.${fileType}`;
      console.log(`   Descargando: ${filename}`);
      
      // PASO 1: Capturar ViewState y cookies de la página
      console.log(`   Capturando ViewState y datos necesarios...`);
      const pageData = await page.evaluate(() => {
        // Buscar el ViewState
        const viewStateInput = document.querySelector('input[name="javax.faces.ViewState"]') as HTMLInputElement;
        const viewState = viewStateInput?.value || '';
        
        console.log(`ViewState capturado: ${viewState.substring(0, 50)}...`);
        
        return {
          viewState,
          url: window.location.href
        };
      });
      
      if (!pageData.viewState) {
        console.log(`   No se pudo capturar ViewState`);
        return null;
      }
      
      // PASO 2: Obtener las cookies de la sesión actual
      console.log(`   Capturando cookies de sesión...`);
      const cookies = await page.cookies();
      const cookieString = cookies.map((c:any) => `${c.name}=${c.value}`).join('; ');
      console.log(`   Cookies capturadas: ${cookies.length} cookies`);
      
      // PASO 3: Construir el form data (igual al ejemplo C#)
      const buttonId = fileType === 'xml' ? invoice.xmlButtonId : invoice.pdfButtonId;
      if (!buttonId) {
        console.log(`   No hay ID de botón`);
        return null;
      }
      
      // Extraer el número de fila del ID (ej: frmPrincipal:tablaCompRecibidos:3:lnkXml -> 3)
      const rowMatch = buttonId.match(/tablaCompRecibidos:(\d+):/);
      const rowNumber = rowMatch ? rowMatch[1] : invoice.rowIndex.toString();
      
      console.log(`   Preparando POST para fila ${rowNumber} (${fileType.toUpperCase()})`);
      
      // Screenshot antes
      await this.takeScreenshot(page, `${fileType}-antes-de-descarga-${invoice.numeroComprobante}`);
      
      // PASO 4: Hacer el POST directo al servidor SRI
      const downloadUrl = 'https://srienlinea.sri.gob.ec/comprobantes-electronicos-internet/pages/consultas/recibidos/comprobantesRecibidos.jsf';
      
      const formData = new URLSearchParams();
      formData.append('frmPrincipal', 'frmPrincipal');
      formData.append('frmPrincipal:opciones', 'ruc');
      formData.append('javax.faces.ViewState', pageData.viewState);
      formData.append('g-recaptcha-response', '');
      
      // Añadir el botón que se está clickeando
      formData.append(buttonId, buttonId);
      
      console.log(`   Haciendo POST a SRI...`);
      try {
        const response = await axios.post(downloadUrl, formData, {
          headers: {
            'Cookie': cookieString,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Referer': 'https://srienlinea.sri.gob.ec/comprobantes-electronicos-internet/pages/consultas/recibidos/comprobantesRecibidos.jsf',
          },
          responseType: 'arraybuffer',
          maxRedirects: 5,
          timeout: 30000,
        });
        
        const buffer = Buffer.from(response.data);
        const contentType = response.headers['content-type'] || '';
        
        console.log(`   Respuesta recibida: ${buffer.length} bytes`);
        console.log(`   Content-Type: ${contentType}`);
        
        // Verificar que es un archivo válido
        if (buffer.length < 100) {
          console.log(`   Respuesta muy pequeña, probablemente un error HTML`);
          console.log(`   Primeros 200 chars: ${buffer.toString('utf-8').substring(0, 200)}`);
          return null;
        }
        
        // Guardar el archivo
        const filePath = path.join(downloadDir, filename);
        await fs.writeFile(filePath, buffer);
        
        console.log(`   ${filename} descargado: ${(buffer.length / 1024).toFixed(2)} KB`);
        
        // SUBIR A S3 INMEDIATAMENTE
        console.log(`   Subiendo a S3...`);
        const s3Filename = `${invoice.claveAcceso}.${fileType}`;
        try {
          const s3Key = await this.fileService.saveFile(buffer, s3Filename, this.user);
          console.log(`   Subido a S3: ${s3Key}`);
          
          // GUARDAR REFERENCIA EN BD
          try {
            const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
            
            // Generar UUID para el documento
            const documentUuid = crypto.randomUUID();
            
            await this.invoiceDocumentDatasource.create({
              documentUuid,
              invoiceUuid: invoice.claveAcceso, // Usar claveAcceso como ID único
              fileName: `${invoice.claveAcceso}.${fileType}`,
              s3Key,
              s3Url,
              fileType: fileType as 'xml' | 'pdf',
              fileSize: buffer.length,
              uploadDate: new Date(),
            });
            
            console.log(`   Referencia guardada en BD: ${documentUuid}`);
          } catch (dbError) {
            console.log(`   Error guardando en BD:`, (dbError as Error).message);
            // No retornar null, continuar de todas formas
          }
          
          // Eliminar archivo local después de subir a S3
          try {
            await fs.unlink(filePath);
            console.log(`   Archivo local eliminado`);
          } catch (unlinkError) {
            console.log(`   Error eliminando archivo local:`, (unlinkError as Error).message);
          }
          
          // Screenshot después
          await this.takeScreenshot(page, `${fileType}-despues-de-descarga-${invoice.numeroComprobante}`);
          
          return { buffer, s3Key };
        } catch (s3Error) {
          console.log(`   Error subiendo a S3:`, (s3Error as Error).message);
          return null;
        }
      } catch (error) {
        console.log(`   Error en POST:`, (error as Error).message);
        if ((error as any).response) {
          console.log(`   Status: ${(error as any).response.status}`);
          console.log(`   Headers: ${JSON.stringify((error as any).response.headers)}`);
          const responseText = Buffer.from((error as any).response.data).toString('utf-8').substring(0, 300);
          console.log(`   Response: ${responseText}`);
        }
        return null;
      }
    } catch (error) {
      console.log(`   Error descargando ${fileType.toUpperCase()}:`, (error as Error).message);
      return null;
    }
  }

  private async processInvoice(
    page: any,
    invoice: InvoiceRecord,
    downloadDir: string
  ): Promise<{ descargados: string[]; status: DocumentStatus }> {
    const descargados: string[] = [];
    
    console.log(`\nProcesando: ${invoice.tipoComprobante} ${invoice.serieComprobante}-${invoice.numeroComprobante}`);
    console.log(`   Clave: ${invoice.claveAcceso}`);
    console.log(`   Total: $${invoice.importeTotal} | Fecha: ${invoice.fechaEmision}`);
    
    // Verificar estado en BD
    const status = await this.checkInvoiceInDatabase(invoice);
    
    if (status.existe) {
      console.log(`   Existe en BD`);
      if (status.tieneXml) console.log(`   XML ya en S3`);
      if (status.tienePdf) console.log(`   PDF ya en S3`);
    } else {
      console.log(`   NO existe en BD - descargaremos y subiremos`);
    }
    
    const nombreBase = `${invoice.rucEmisor}_${invoice.serieComprobante}-${invoice.numeroComprobante}`;
    
    // Si NO existe en BD, descargar y subir a S3
    if (!status.existe) {
      console.log(`   Descargando documentos para subir a S3...`);
      
      // Descargar y subir XML
      if (invoice.xmlButtonId || invoice.xmlButtonOnclick) {
        const xmlResult = await this.downloadFile(page, invoice, 'xml', downloadDir);
        if (xmlResult) {
          console.log(`   XML subido a S3: ${xmlResult.s3Key}`);
          descargados.push(`${nombreBase}.xml`);
        }
      }
      
      // Descargar y subir PDF
      if (invoice.pdfButtonId || invoice.pdfButtonOnclick) {
        const pdfResult = await this.downloadFile(page, invoice, 'pdf', downloadDir);
        if (pdfResult) {
          console.log(`   PDF subido a S3: ${pdfResult.s3Key}`);
          descargados.push(`${nombreBase}.pdf`);
        }
      }
    } else if (!status.tieneXml || !status.tienePdf) {
      console.log(`   Documentos faltantes en S3:`);
      if (!status.tieneXml) console.log(`      - XML faltante`);
      if (!status.tienePdf) console.log(`      - PDF faltante`);
    }
    
    if (descargados.length > 0) {
      console.log(`   Archivos procesados: ${descargados.length}`);
    } else if (status.existe && status.tieneXml && status.tienePdf) {
      console.log(`   ⏭️  Todo existe en BD y S3`);
    }
    
    return { descargados, status };
  }

  async descargarInvoices(config: SRIDownloadConfig): Promise<string[]> {
    console.log('Iniciando descarga de invoices SRI...\n');

    await fs.mkdir(config.descargasDir, { recursive: true });
    await fs.mkdir(this.screenshotsDir, { recursive: true });

    let browser, page;
    const descargados: string[] = [];

    try {
      console.log('Lanzando navegador (puppeteer-real-browser)...');

      const { browser: realBrowser, page: realPage } = await connect({
        headless: false,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--window-size=1920,1080',
          '--no-first-run',
          '--no-default-browser-check',
        ],
        customConfig: {},
      } as any);

      await realPage.setViewport({
        width: 1920,
        height: 1080,
      });

      browser = realBrowser;
      page = realPage;

      console.log('Navegador lanzado\n');

      console.log('Navegando a SRI...');
      await page.goto(this.sriUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      await this.takeScreenshot(page, '01-pagina-inicial');
      console.log('Página cargada\n');

      console.log('Buscando botón de inicio de sesión...');
      await this.randomDelay(1000, 2000);

      try {
        const loginBtn = await page.$('a[href="/sri-en-linea/contribuyente/perfil"]');
        if (loginBtn) {
          await this.humanClick(page, 'a[href="/sri-en-linea/contribuyente/perfil"]');
          console.log('Clic en iniciar sesión');
          await this.delay(2000);
        }
      } catch (e) {
        console.log('No encontró botón, continuando...');
      }

      await this.takeScreenshot(page, '02-pagina-login');

      console.log('Ingresando credenciales...');
      await page.waitForSelector('#usuario', { timeout: 10000 });
      await this.randomDelay(500, 1000);

      console.log(`  Escribiendo RUC: ${config.ruc}`);
      await this.humanType(page, '#usuario', config.ruc);
      await this.randomDelay(300, 600);

      await this.humanClick(page, '#password');
      await this.randomDelay(200, 400);

      console.log(`  Escribiendo contraseña`);
      await this.humanType(page, '#password', config.password);
      await this.randomDelay(500, 1000);

      await this.takeScreenshot(page, '03-credenciales');
      console.log('Credenciales ingresadas\n');

      console.log('Haciendo clic en "Ingresar"...');
      try {
        await page.waitForSelector('#kc-login', { timeout: 5000 });
        await this.humanClick(page, '#kc-login');
      } catch (e) {
        console.log('  Intentando botón alternativo...');
        await this.humanClick(page, '#btnIngresar');
      }

      console.log('  Esperando procesamiento del login...');
      await this.delay(3000);

      await this.takeScreenshot(page, '04-login-exitoso');
      console.log('Login procesado\n');

      console.log('Navegando a comprobantes recibidos...');
      await this.randomDelay(1000, 2000);

      console.log('  Buscando "FACTURACIÓN ELECTRÓNICA"...');
      try {
        const facturacionClick = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a.ui-panelmenu-header-link'));
          const link = links.find(a => a.textContent!.includes('FACTURACIÓN ELECTRÓNICA'));
          if (link) {
            (link as any).click();
            return true;
          }
          return false;
        });

        if (facturacionClick) {
          console.log('  FACTURACIÓN ELECTRÓNICA expandido');
          await this.delay(1000);
          await this.takeScreenshot(page, '06-facturacion-expandida');
        }
      } catch (e) {
        console.log('  Error expandiendo FACTURACIÓN ELECTRÓNICA');
      }

      console.log('  Buscando "Comprobantes electrónicos recibidos"...');
      try {
        const recibidosClick = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a.ui-menuitem-link'));
          const link = links.find(a => {
            const href = (a as any).href || '';
            return a.textContent!.includes('Comprobantes electrónicos recibidos') ||
              href.includes('accederAplicacion.jspa?redireccion=57');
          });
          if (link) {
            (link as any).click();
            return true;
          }
          return false;
        });

        if (recibidosClick) {
          console.log('  Entrando a Comprobantes electrónicos recibidos');
          await this.delay(2000);
          await this.takeScreenshot(page, '07-comprobantes-recibidos');
        } else {
          console.log('  No encontró "Comprobantes electrónicos recibidos"');
        }
      } catch (e) {
        console.log('  Error buscando comprobantes');
      }

      await this.takeScreenshot(page, '08-pagina-busqueda');
      console.log('En página de búsqueda de comprobantes\n');

      console.log('Aplicando filtros de búsqueda...');
      await this.delay(3000);

      const pageInfo = await page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          tables: document.querySelectorAll('table').length,
          buttons: document.querySelectorAll('button').length,
          selects: document.querySelectorAll('select').length,
          iframes: document.querySelectorAll('iframe').length,
        };
      });

      console.log('  Estado de página:', pageInfo);

      try {
        const selects = await page.$$('select');
        console.log(`  Encontrados ${selects.length} selects en página`);

        const diaSelect = await page.$('#frmPrincipal\\:dia');
        if (diaSelect) {
          await this.humanClick(page, '#frmPrincipal\\:dia');
          await this.delay(300);
          await page.select('#frmPrincipal\\:dia', '0');
          console.log('  Seleccionado "Todos" en filtro de día');
          await this.delay(500);
          await this.takeScreenshot(page, '09-filtro-todos-seleccionado');
        } else {
          console.log('  No se encontró selector #frmPrincipal:dia');
        }
      } catch (e) {
        console.log('  Error seleccionando filtro de día:', (e as Error).message);
      }

      console.log('  Buscando botón Consultar...');
      try {
        const buttons = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('button')).map((b, idx) => ({
            text: b.textContent?.substring(0, 50),
            index: idx,
          }));
        });

        console.log(`  Encontrados ${buttons.length} botones`);
        buttons.forEach(b => console.log(`     [${b.index}] ${b.text}`));

        const consultarClick = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const btn = buttons.find(b =>
            b.textContent!.includes('Consultar') ||
            b.textContent!.includes('Buscar') ||
            b.textContent!.includes('Enviar')
          );
          if (btn) {
            (btn as any).click();
            return true;
          }
          return false;
        });

        if (consultarClick) {
          console.log('Botón Consultar encontrado y presionado');
          await this.delay(2000);
          
          // ⬇️ AQUÍ VA - Esperar a que la tabla cargue
          console.log('Esperando carga de tabla de comprobantes...');
          await page.waitForSelector('tbody#frmPrincipal\\:tablaCompRecibidos_data tr[data-ri]', { 
            timeout: 10000 
          });
          
          // ⬇️ AQUÍ VA - Extraer las facturas
          console.log('Extrayendo facturas de la tabla...');
          const invoices = await this.extractInvoicesFromTable(page);
          console.log(`${invoices.length} facturas encontradas en la tabla\n`);
          console.log("invoices:", invoices);
          
          for (const invoice of invoices) {
            const result = await this.processInvoice(page, invoice, config.descargasDir);
            descargados.push(...result.descargados);
          }
        }
      } catch (e) {
        console.log('  Error haciendo clic en Consultar:', (e as Error).message);
      }

      console.log('\nDescarga completada');
      console.log(`Total descargados: ${descargados.length} archivos`);

      return descargados;

    } catch (error) {
      console.error('\nError:', error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      if (browser) {
        console.log('Cerrando navegador...');
        await browser.close();
      }
    }
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      console.log('Iniciando sesión en SRI...');
      const { browser: realBrowser, page: realPage } = await connect({
        headless: false,
        args: ['--disable-blink-features=AutomationControlled', '--window-size=1920,1080'],
        customConfig: {},
      } as any);

      await realPage.setViewport({ width: 1920, height: 1080 });
      this.browser = realBrowser;
      this.page = realPage;

      await this.page.goto(this.sriUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      try {
        const loginBtn = await this.page.$('a[href="/sri-en-linea/contribuyente/perfil"]');
        if (loginBtn) {
          await this.humanClick(this.page, 'a[href="/sri-en-linea/contribuyente/perfil"]');
          await this.delay(2000);
        }
      } catch (e) {
        // ignore
      }

      await this.page.waitForSelector('#usuario', { timeout: 10000 });
      await this.humanType(this.page, '#usuario', username);
      await this.humanClick(this.page, '#password');
      await this.humanType(this.page, '#password', password);

      try {
        await this.page.waitForSelector('#kc-login', { timeout: 5000 });
        await this.humanClick(this.page, '#kc-login');
      } catch (e) {
        await this.humanClick(this.page, '#btnIngresar');
      }

      await this.delay(3000);
      console.log('Login completado');
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  async downloadInvoices(): Promise<any[]> {
    try {
      if (!this.page) throw new Error('Navegador no inicializado');

      console.log('Navegando a comprobantes recibidos...');
      await this.randomDelay(1000, 2000);

      try {
        const facturacionClick = await this.page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a.ui-panelmenu-header-link'));
          const link = links.find(a => a.textContent!.includes('FACTURACIÓN ELECTRÓNICA'));
          if (link) { (link as any).click(); return true; }
          return false;
        });
        if (facturacionClick) {
          console.log('FACTURACIÓN ELECTRÓNICA expandido');
          await this.delay(1000);
        }
      } catch (e) {
        // ignore
      }

      return [];
    } catch (error) {
      console.error('Error descargando invoices:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.browser) {
        console.log('Cerrando navegador...');
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }
    } catch (error) {
      console.error('Error cerrando navegador:', error);
    }
  }
}
