import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser, Page } from "puppeteer";

// Aplicar stealth plugin
puppeteer.use(StealthPlugin());

/**
 * Servicio para interactuar con el portal del SRI
 * Automatiza el login y descarga de archivos usando Puppeteer
 */
export class SRIService {
  private browser: Browser | null = null;
  private page: Page | null = null;

  // URLs del SRI
  private readonly SRI_LOGIN_URL = "https://srienlinea.sri.gob.ec/sri-en-linea/inicio/NAT";
  private readonly SRI_HOME_URL = "https://srienlinea.sri.gob.ec/";

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
   * @returns true si el login fue exitoso
   */
  async login(username: string, password: string): Promise<boolean> {
    try {
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
   * @returns Ruta del archivo descargado
   */
  async downloadInvoices(fechaInicio: string): Promise<string> {
    try {
      if (!this.page) {
        throw new Error("No hay sesión activa. Primero debes hacer login.");
      }

      console.log(`Descargando facturas desde ${fechaInicio} ...`);
      //claude
      // Seleccionar "Todos" en el combo de día
      console.log("Seleccionando 'Todos' en el combo de día...");
      await this.delay(5000); // Esperar a que se actualice
      await this.page.select('#frmPrincipal\\:dia', '0');
      
      // Simulación avanzada de comportamiento humano
      console.log("Simulando comportamiento humano realista...");
      
      // Hacer scroll en la página
      await this.page.evaluate(() => {
        window.scrollBy(0, 100);
      });
      await this.delay(this.randomDelay(800, 1200));
      
      // Scroll hacia arriba
      await this.page.evaluate(() => {
        window.scrollBy(0, -50);
      });
      await this.delay(this.randomDelay(600, 1000));
      
      // Mover mouse con patrón más natural
      const button = await this.page.$('#frmPrincipal\\:btnBuscar');
      const boundingBox = await button?.boundingBox();
      
      if (boundingBox) {
        // Movimientos aleatorios antes de llegar al botón
        await this.page.mouse.move(200, 200);
        await this.delay(this.randomDelay(300, 600));
        
        await this.page.mouse.move(300, 250);
        await this.delay(this.randomDelay(300, 600));
        
        await this.page.mouse.move(400, 300);
        await this.delay(this.randomDelay(400, 800));
        
        // Mover lentamente hacia el botón
        const steps = 10;
        const startX = 400;
        const startY = 300;
        const endX = boundingBox.x + boundingBox.width / 2;
        const endY = boundingBox.y + boundingBox.height / 2;
        
        for (let i = 0; i <= steps; i++) {
          const x = startX + (endX - startX) * (i / steps);
          const y = startY + (endY - startY) * (i / steps);
          await this.page.mouse.move(x, y);
          await this.delay(this.randomDelay(50, 150));
        }
        
        // Hover sobre el botón antes de hacer clic
        await this.delay(this.randomDelay(500, 1000));
        
        // Hacer clic con reintentos automáticos si sale captcha
        console.log("Haciendo clic en el botón Consultar...");
        await this.clickWithCaptchaRetry('#frmPrincipal\\:btnBuscar');
      } else {
        console.log("No se pudo encontrar el botón de búsqueda");
        throw new Error("Botón de búsqueda no encontrado");
      }
      await this.delay(50000000); // Esperar a que cargue los resultados
      return "";
    } catch (error) {
      console.error("Error al descargar facturas:", error);
      throw error;
    }
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
   */
  private async clickWithCaptchaRetry(
    selector: string,
    maxRetries: number = 10
  ): Promise<void> {
    let retries = 0;
    let captchaError = false;

    do {
      captchaError = false;
      console.log(`Intento ${retries + 1} de ${maxRetries}...`);
      
      // Hacer clic
      await this.page?.click(selector);
      
      // Esperar a que se procese la búsqueda
      await this.delay(this.randomDelay(3000, 5000));
      
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
        console.warn(
          `⚠️ Captcha incorrecta detectada. Reintentando (${retries}/${maxRetries})...`
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
        
        await this.delay(this.randomDelay(1000, 2000));
        
        // Simular comportamiento humano antes de reintentar
        await this.page?.mouse.move(
          this.randomDelay(100, 300),
          this.randomDelay(100, 300)
        );
        await this.delay(this.randomDelay(500, 1000));
      } else {
        console.log("✅ Búsqueda exitosa, sin errores de captcha");
      }
    } while (captchaError && retries < maxRetries);

    if (captchaError && retries >= maxRetries) {
      throw new Error(
        `Falló después de ${maxRetries} intentos. El captcha sigue siendo incorrecto.`
      );
    }
  }
}
