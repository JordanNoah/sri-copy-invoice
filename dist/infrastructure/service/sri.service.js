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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SRIService = void 0;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
// Aplicar stealth plugin
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
/**
 * Servicio para interactuar con el portal del SRI
 * Automatiza el login y descarga de archivos usando Puppeteer
 */
class SRIService {
    constructor(fileService, invoiceRepository, invoiceDocumentRepository) {
        this.fileService = fileService;
        this.invoiceRepository = invoiceRepository;
        this.invoiceDocumentRepository = invoiceDocumentRepository;
        this.browser = null;
        this.page = null;
        this.companyUuid = "";
        this.companyRuc = "";
        // URLs del SRI
        this.SRI_LOGIN_URL = "https://srienlinea.sri.gob.ec/sri-en-linea/inicio/NAT";
        this.SRI_HOME_URL = "https://srienlinea.sri.gob.ec/";
    }
    /**
     * Inicializar el navegador
     */
    initBrowser() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.browser) {
                this.browser = yield puppeteer_extra_1.default.launch({
                    headless: false, // Cambia a true en producción
                    args: [
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-gpu",
                    ],
                });
                this.page = yield this.browser.newPage();
                yield this.page.setViewport({ width: 1366, height: 768 });
                // Configurar User-Agent realista (como navegador real)
                yield this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
                // Agregar headers adicionales para parecer más real
                yield this.page.setExtraHTTPHeaders({
                    'Accept-Language': 'es-EC,es;q=0.9',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                });
                // Configurar timeout por defecto
                this.page.setDefaultTimeout(60000); // 60 segundos
            }
        });
    }
    /**
     * Hacer login en el SRI
     * @param username Usuario (RUC o cédula)
     * @param password Contraseña
     * @param companyUuid UUID de la empresa
     * @param companyRuc RUC de la empresa
     * @returns true si el login fue exitoso
     */
    login(username, password, companyUuid, companyRuc) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.companyUuid = companyUuid;
                this.companyRuc = companyRuc;
                yield this.initBrowser();
                if (!this.page) {
                    throw new Error("No se pudo inicializar el navegador");
                }
                console.log("Navegando a la página de login del SRI...");
                yield this.page.goto(this.SRI_LOGIN_URL, {
                    waitUntil: "networkidle2",
                });
                // Esperar a que DOM esté completamente listo
                yield this.page.waitForFunction(() => {
                    return document.readyState === 'complete';
                }, { timeout: 10000 }).catch(() => { });
                console.log("Esperando formulario de login...");
                // Hacer clic en el botón "Iniciar sesión"
                console.log("Haciendo clic en el botón de iniciar sesión...");
                yield this.page.click('a.sri-tamano-link-iniciar-sesion[href="/sri-en-linea/contribuyente/perfil"]');
                // Esperar a que se cargue la página de login
                yield this.page.waitForNavigation({ waitUntil: "networkidle2" });
                // Esperar a que toda la red esté completamente inactiva
                yield this.page.waitForFunction(() => {
                    return document.readyState === 'complete';
                }, { timeout: 10000 }).catch(() => { });
                // Ingresar usuario
                yield this.page.type('input[name="usuario"]', username, { delay: 100 });
                // Ingresar contraseña
                yield this.page.type('input[name="password"]', password, { delay: 100 });
                // Hacer clic en el botón de login
                console.log("Haciendo clic en el botón de ingresar...");
                yield this.page.click('#kc-login');
                // Esperar simple: networkidle2 es suficiente, networkidle0 es muy restrictivo
                try {
                    yield this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
                }
                catch (e) {
                    console.log("⚠️ Timeout en navegación, continuando...");
                }
                yield this.delay(2000); // Esperar simple sin validaciones complejas
                // Esperar a que el elemento #sri-menu exista ANTES de hacer clic
                console.log("👁️ Buscando elemento #sri-menu...");
                try {
                    yield this.page.waitForSelector('#sri-menu', { timeout: 5000 });
                    console.log("✅ Elemento #sri-menu encontrado");
                }
                catch (e) {
                    console.error("❌ #sri-menu no encontrado. Tomando screenshot para debug...");
                    yield this.screenshot(`debug-login-${Date.now()}.png`);
                    throw new Error("Elemento #sri-menu no encontrado después del login.");
                }
                // Hacer clic en el botón de expandir menú
                console.log("Haciendo clic en el botón de expandir menú...");
                yield this.page.click('#sri-menu');
                yield this.delay(500); // Espera simple
                // Hacer clic en el menú de Facturación Electrónica
                console.log("Haciendo clic en el menú de Facturación Electrónica...");
                // Espera simple para que el menú se expanda
                yield this.delay(800);
                // Buscar y hacer clic
                const facturacionClicked = yield this.page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('a.ui-panelmenu-header-link'));
                    const facturacionLink = links.find(link => link.textContent.includes('FACTURACIÓN ELECTRÓNICA'));
                    if (facturacionLink) {
                        facturacionLink.click();
                        return true;
                    }
                    return false;
                });
                if (!facturacionClicked) {
                    console.warn("⚠️ Link de Facturación no encontrado, tomando screenshot...");
                    yield this.screenshot(`debug-facturacion-${Date.now()}.png`);
                }
                yield this.delay(1000); // Espera simple
                // Hacer clic en "Comprobantes electrónicos recibidos"
                console.log("Haciendo clic en Comprobantes electrónicos recibidos...");
                // Preparar listener para navegación ANTES del click
                const navigationPromise = this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => { });
                const comprobantesClicked = yield this.page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('a.ui-menuitem-link'));
                    const comprobantesLink = links.find(link => link.textContent.includes('Comprobantes electrónicos recibidos'));
                    if (comprobantesLink) {
                        comprobantesLink.click();
                        return true;
                    }
                    return false;
                });
                if (!comprobantesClicked) {
                    console.error("❌ Link de Comprobantes no encontrado");
                    yield this.screenshot(`debug-comprobantes-${Date.now()}.png`);
                    throw new Error("Link de Comprobantes electrónicos recibidos no encontrado.");
                }
                // Esperar a que se navegue
                yield navigationPromise;
                yield this.delay(2000); // Espera final
                return true;
            }
            catch (error) {
                console.error("Error durante el login al SRI:", error);
                throw error;
            }
        });
    }
    /**
     * Descargar comprobantes electrónicos
     * Scrapes los datos de la tabla, descarga XML/PDF y guarda en BD + S3
     * @param fechaInicio Fecha de inicio para la búsqueda
     * @returns Array de objetos con información de las facturas descargadas
     */
    downloadInvoices(fechaInicio) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield this.delay(2000);
                yield this.page.select('#frmPrincipal\\:dia', '0');
                yield this.delay(1000);
                // Simulación de comportamiento humano
                console.log("Simulando comportamiento humano...");
                yield this.page.evaluate(() => {
                    window.scrollBy(0, 100);
                });
                yield this.delay(this.randomDelay(600, 1000));
                // Hacer clic en el botón de búsqueda con reintentos si hay captcha
                console.log("Haciendo clic en el botón Consultar...");
                yield this.clickWithCaptchaRetry('#frmPrincipal\\:btnBuscar');
                // Esperar con networkidle0 (todas las conexiones cerradas)
                console.log("⏳ Esperando a que se carguen resultados...");
                yield this.page.waitForFunction(() => {
                    return document.readyState === 'complete';
                }, { timeout: 20000 }).catch(() => { });
                // Esperar a que se estabilice la red
                yield this.delay(this.randomDelay(2000, 3000));
                // Esperar a que cargue la tabla de resultados
                console.log("Esperando que se cargue la tabla de resultados...");
                yield this.page.waitForSelector('table[role="grid"]', { timeout: 30000 }).catch(() => {
                    console.warn("Tabla de resultados no encontrada (puede estar vacía)");
                });
                yield this.delay(2000); // Esperar a que se carguen completamente los datos
                // Scraping de datos de la tabla
                console.log("Extrayendo datos de facturas...");
                const invoiceRows = yield this.page.evaluate(() => {
                    const rows = [];
                    const tableRows = document.querySelectorAll('table[role="grid"] tbody tr');
                    tableRows.forEach((row, index) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h;
                        const cells = row.querySelectorAll('td');
                        if (cells.length >= 4) {
                            rows.push({
                                invoiceNumber: ((_b = (_a = cells[1]) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '',
                                ruc: ((_d = (_c = cells[2]) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '',
                                amount: ((_f = (_e = cells[3]) === null || _e === void 0 ? void 0 : _e.textContent) === null || _f === void 0 ? void 0 : _f.trim()) || '',
                                date: ((_h = (_g = cells[0]) === null || _g === void 0 ? void 0 : _g.textContent) === null || _h === void 0 ? void 0 : _h.trim()) || '',
                                rowIndex: index,
                            });
                        }
                    });
                    return rows;
                });
                console.log(`Se encontraron ${invoiceRows.length} facturas`);
                const downloadedInvoices = [];
                // Descargar cada factura
                for (let i = 0; i < invoiceRows.length; i++) {
                    const row = invoiceRows[i];
                    console.log(`\n[${i + 1}/${invoiceRows.length}] Procesando factura: ${row.invoiceNumber}`);
                    try {
                        // Hacer clic en la fila para expandir y mostrar opciones de descarga
                        yield this.page.evaluate((rowIndex) => {
                            const rows = document.querySelectorAll('table[role="grid"] tbody tr');
                            if (rows[rowIndex]) {
                                rows[rowIndex].click();
                            }
                        }, row.rowIndex);
                        yield this.delay(this.randomDelay(1000, 2000));
                        // Extraer URLs de descargas de XML y PDF
                        const downloadUrls = yield this.page.evaluate(() => {
                            const links = {};
                            const downloadLinks = document.querySelectorAll('a[onclick*="descargarArchivo"]');
                            downloadLinks.forEach((link) => {
                                var _a;
                                const href = link.getAttribute('href');
                                const text = ((_a = link.textContent) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
                                if (text.includes('xml') || (href === null || href === void 0 ? void 0 : href.includes('xml'))) {
                                    links.xml = href || undefined;
                                }
                                else if (text.includes('pdf') || (href === null || href === void 0 ? void 0 : href.includes('pdf'))) {
                                    links.pdf = href || undefined;
                                }
                            });
                            return links;
                        });
                        // Crear registro de invoice en BD
                        const invoiceData = {
                            invoiceUuid: this.generateUUID(),
                            companyUuid: this.companyUuid,
                            invoiceNumber: row.invoiceNumber,
                            invoiceDate: new Date(row.date),
                            amount: parseFloat(row.amount.replace(/[^\d.-]/g, '')) || 0,
                            description: `Factura de ${row.ruc}`,
                        };
                        const createdInvoice = yield this.invoiceRepository.create(invoiceData);
                        console.log(`✓ Factura guardada en BD: ${createdInvoice.invoiceUuid}`);
                        // Descargar y guardar archivos
                        const documents = [];
                        // Descargar XML
                        if (downloadUrls.xml) {
                            try {
                                console.log("  ↓ Descargando XML...");
                                const xmlBuffer = yield this.downloadFile(downloadUrls.xml);
                                const xmlFileName = `${row.invoiceNumber}.xml`;
                                const xmlS3Key = yield this.fileService.saveFile(xmlBuffer, xmlFileName, this.companyRuc);
                                const xmlDoc = {
                                    documentUuid: this.generateUUID(),
                                    invoiceUuid: invoiceData.invoiceUuid,
                                    fileName: xmlFileName,
                                    s3Key: xmlS3Key,
                                    s3Url: this.fileService.getFileUrl(xmlS3Key),
                                    fileType: 'xml',
                                    fileSize: xmlBuffer.length,
                                    uploadDate: new Date(),
                                };
                                yield this.invoiceDocumentRepository.create(xmlDoc);
                                documents.push(xmlDoc);
                                console.log(`  ✓ XML guardado: ${xmlS3Key}`);
                            }
                            catch (error) {
                                console.error(`  ✗ Error descargando XML:`, error);
                            }
                        }
                        // Descargar PDF
                        if (downloadUrls.pdf) {
                            try {
                                console.log("  ↓ Descargando PDF...");
                                const pdfBuffer = yield this.downloadFile(downloadUrls.pdf);
                                const pdfFileName = `${row.invoiceNumber}.pdf`;
                                const pdfS3Key = yield this.fileService.saveFile(pdfBuffer, pdfFileName, this.companyRuc);
                                const pdfDoc = {
                                    documentUuid: this.generateUUID(),
                                    invoiceUuid: invoiceData.invoiceUuid,
                                    fileName: pdfFileName,
                                    s3Key: pdfS3Key,
                                    s3Url: this.fileService.getFileUrl(pdfS3Key),
                                    fileType: 'pdf',
                                    fileSize: pdfBuffer.length,
                                    uploadDate: new Date(),
                                };
                                yield this.invoiceDocumentRepository.create(pdfDoc);
                                documents.push(pdfDoc);
                                console.log(`  ✓ PDF guardado: ${pdfS3Key}`);
                            }
                            catch (error) {
                                console.error(`  ✗ Error descargando PDF:`, error);
                            }
                        }
                        downloadedInvoices.push(invoiceData);
                        // Comportamiento humano entre descargas
                        yield this.delay(this.randomDelay(1500, 3000));
                    }
                    catch (error) {
                        console.error(`✗ Error procesando factura ${row.invoiceNumber}:`, error);
                        continue; // Continuar con la siguiente factura
                    }
                }
                console.log(`\n✅ Descarga completada: ${downloadedInvoices.length} facturas procesadas`);
                return downloadedInvoices;
            }
            catch (error) {
                console.error("Error al descargar facturas:", error);
                throw error;
            }
        });
    }
    /**
     * Descargar archivo como buffer
     * Usa networkidle para esperar a que se complete la descarga
     */
    downloadFile(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page) {
                throw new Error("No hay página activa");
            }
            try {
                // Interceptar la respuesta para obtener el buffer
                let fileBuffer = null;
                const responseHandler = (response) => {
                    if (response.url() === url) {
                        response.buffer().then((buffer) => {
                            fileBuffer = buffer;
                        });
                    }
                };
                this.page.on('response', responseHandler);
                try {
                    yield this.page.goto(url, {
                        waitUntil: 'networkidle0',
                        timeout: 30000,
                    });
                }
                finally {
                    this.page.off('response', responseHandler);
                }
                // Si no se interceptó, intentar obtener el body
                if (!fileBuffer) {
                    const response = yield this.page.goto(url, {
                        waitUntil: 'networkidle0',
                    });
                    if (!response) {
                        throw new Error('No se pudo obtener respuesta del servidor');
                    }
                    fileBuffer = yield response.buffer();
                }
                return fileBuffer || Buffer.alloc(0);
            }
            catch (error) {
                throw new Error(`Error descargando archivo: ${error}`);
            }
        });
    }
    /**
     * Generar UUID v4
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    /**
     * Cerrar el navegador
     */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.browser) {
                yield this.browser.close();
                this.browser = null;
                this.page = null;
                console.log("Navegador cerrado");
            }
        });
    }
    /**
     * Obtener screenshot de la página actual (útil para debugging)
     */
    screenshot(path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.page) {
                yield this.page.screenshot({ path, fullPage: true });
                console.log(`Screenshot guardado en: ${path}`);
            }
        });
    }
    /**
     * Verificar si hay sesión activa
     */
    isSessionActive() {
        return this.browser !== null && this.page !== null;
    }
    /**
     * Helper para delay (reemplazo de waitForTimeout)
     */
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Generar un delay aleatorio entre min y max ms
     */
    randomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    /**
     * Hacer clic en un botón y reintentar si aparece error de captcha
     * Con comportamiento humano mejorado y más reintentos
     */
    clickWithCaptchaRetry(selector_1) {
        return __awaiter(this, arguments, void 0, function* (selector, maxRetries = 20) {
            var _a, _b, _c, _d, _e, _f;
            let retries = 0;
            let captchaError = false;
            do {
                captchaError = false;
                const attemptNumber = retries + 1;
                console.log(`🔄 Intento ${attemptNumber} de ${maxRetries}...`);
                // Validar que el captcha esté visible antes de hacer clic
                if (attemptNumber === 1) {
                    console.log("👁️ Esperando a que captcha esté visible...");
                    yield this.waitForCaptchaVisible();
                }
                // Comportamiento humano: scrolling suave antes del clic
                yield this.simulateHumanScrolling();
                // Esperar un poco para "leer" el formulario
                yield this.delay(this.randomDelay(500, 1200));
                // Mover mouse lentamente hacia el botón
                yield this.moveMouseToButton(selector);
                // Esperar un poco antes de hacer clic (simulando decisión)
                yield this.delay(this.randomDelay(300, 700));
                // Hacer clic
                yield ((_a = this.page) === null || _a === void 0 ? void 0 : _a.click(selector));
                // Esperar a que se procese la búsqueda (más tiempo en intentos posteriores)
                const baseWait = 3000 + attemptNumber * 500; // Aumenta conforme avanzan intentos
                const processWait = this.randomDelay(baseWait, baseWait + 2000);
                console.log(`⏳ Esperando ${processWait}ms para procesamiento...`);
                // Esperar con verificación de red
                yield this.delay(processWait);
                // Verificar que la página esté estable
                yield ((_b = this.page) === null || _b === void 0 ? void 0 : _b.waitForFunction(() => {
                    return document.readyState === 'complete';
                }, { timeout: 5000 }).catch(() => { }));
                // Revisar si aparece el mensaje de captcha incorrecto
                const captchaErrorElement = yield ((_c = this.page) === null || _c === void 0 ? void 0 : _c.evaluate(() => {
                    const messages = document.getElementById('formMessages:messages');
                    if (messages) {
                        const errorText = messages.textContent;
                        return errorText && errorText.includes('Captcha incorrecta');
                    }
                    return false;
                }));
                if (captchaErrorElement) {
                    captchaError = true;
                    retries++;
                    const percentComplete = Math.round((attemptNumber / maxRetries) * 100);
                    console.warn(`⚠️ Captcha incorrecta en intento ${attemptNumber}. Reintentando... [${percentComplete}%]`);
                    // Cerrar el mensaje de error
                    yield ((_d = this.page) === null || _d === void 0 ? void 0 : _d.evaluate(() => {
                        const closeButton = document.querySelector('#formMessages\\:messages .ui-messages-close');
                        if (closeButton) {
                            closeButton.click();
                        }
                    }));
                    // Esperar un poco después de cerrar el mensaje
                    yield this.delay(this.randomDelay(800, 1500));
                    // Refrescar el captcha (si es posible)
                    yield ((_e = this.page) === null || _e === void 0 ? void 0 : _e.evaluate(() => {
                        const refreshButton = document.querySelector('[aria-label="Recargar captcha"]');
                        if (refreshButton) {
                            refreshButton.click();
                        }
                    }));
                    // Esperar a que se recargue el captcha
                    yield this.delay(this.randomDelay(1500, 2500));
                    // Validar que el nuevo captcha esté cargado
                    yield this.waitForCaptchaVisible();
                    // Comportamiento humano después de error: frustración simulada
                    if (attemptNumber % 3 === 0) {
                        // Cada 3 intentos, esperar un poco más (simular pausa para "revisar")
                        console.log("🤔 Revisando formulario nuevamente...");
                        yield this.simulateHumanScrolling();
                        yield this.delay(this.randomDelay(2000, 3000));
                    }
                    else if (attemptNumber % 5 === 0) {
                        // Cada 5 intentos, hacer scroll al inicio y esperar
                        console.log("📜 Scroll completo del formulario...");
                        yield ((_f = this.page) === null || _f === void 0 ? void 0 : _f.evaluate(() => {
                            window.scrollTo(0, 0);
                        }));
                        yield this.delay(this.randomDelay(1000, 2000));
                    }
                    // Simular comportamiento humano: mover mouse aleatoriamente
                    yield this.simulateRandomMouseMovement();
                    // Esperar antes del próximo intento (más tiempo conforme avanzan intentos)
                    const waitBeforeNext = 1000 + attemptNumber * 200;
                    yield this.delay(this.randomDelay(waitBeforeNext, waitBeforeNext + 800));
                }
                else {
                    console.log("✅ Búsqueda exitosa, sin errores de captcha");
                }
            } while (captchaError && retries < maxRetries);
            if (captchaError && retries >= maxRetries) {
                throw new Error(`Falló después de ${maxRetries} intentos. El captcha sigue siendo incorrecto. Intenta nuevamente más tarde.`);
            }
        });
    }
    /**
     * Simular scrolling humano en la página
     */
    simulateHumanScrolling() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                return;
            const scrolls = [
                { direction: "down", amount: this.randomDelay(100, 200) },
                { direction: "up", amount: this.randomDelay(50, 100) },
                { direction: "down", amount: this.randomDelay(100, 150) },
            ];
            for (const scroll of scrolls) {
                const direction = scroll.direction === "down" ? 1 : -1;
                yield this.page.evaluate((amount, dir) => {
                    window.scrollBy(0, amount * dir);
                }, scroll.amount, direction);
                yield this.delay(this.randomDelay(200, 400));
            }
        });
    }
    /**
     * Mover mouse lentamente hacia un botón
     */
    moveMouseToButton(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                return;
            const button = yield this.page.$(selector);
            if (!button)
                return;
            const boundingBox = yield button.boundingBox();
            if (!boundingBox)
                return;
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
                yield this.page.mouse.move(x, y);
                yield this.delay(this.randomDelay(30, 80));
                // Simular pequeñas pausas/temblores humanos
                if (i % 5 === 0 && i > 0) {
                    yield this.delay(this.randomDelay(50, 150));
                }
            }
            // Hover sobre el botón
            yield this.delay(this.randomDelay(200, 500));
        });
    }
    /**
     * Simular movimientos aleatorios del mouse
     */
    simulateRandomMouseMovement() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                return;
            const movements = this.randomDelay(2, 4);
            for (let i = 0; i < movements; i++) {
                const x = this.randomDelay(200, 1000);
                const y = this.randomDelay(200, 600);
                yield this.page.mouse.move(x, y);
                yield this.delay(this.randomDelay(100, 300));
            }
        });
    }
    /**
     * Validar que el captcha está cargado en la página
     */
    validateCaptchaLoaded() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                return false;
            try {
                const iframeVisible = yield this.page.evaluate(() => {
                    // Buscar iframe de reCAPTCHA o similar
                    const recaptchaIframe = document.querySelector('iframe[src*="recaptcha"]');
                    const genericCaptcha = document.querySelector('[data-captcha], .captcha, #captcha, .g-recaptcha');
                    return !!(recaptchaIframe || genericCaptcha);
                });
                return iframeVisible;
            }
            catch (_a) {
                return false;
            }
        });
    }
    /**
     * Esperar a que el captcha esté visible y listo
     */
    waitForCaptchaVisible() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.page)
                return;
            try {
                yield this.page.waitForFunction(() => {
                    const captcha = document.querySelector('[data-captcha], .captcha, #captcha, .g-recaptcha, iframe[src*="recaptcha"]');
                    return captcha && captcha.offsetHeight > 0;
                }, { timeout: 10000 });
                // Esperar a que esté completamente listo
                yield this.delay(this.randomDelay(500, 1000));
            }
            catch (_a) {
                console.log("⚠️ Captcha no visible (puede estar en método alternativo)");
            }
        });
    }
}
exports.SRIService = SRIService;
