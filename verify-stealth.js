#!/usr/bin/env node

/**
 * Script de verificación de anti-detección
 * Ejecutar: node verify-stealth.js
 * 
 * Este script verifica que:
 * 1. userDataDir se está usando
 * 2. Stealth plugin está activo
 * 3. navigator.webdriver está eliminado
 * 4. Chrome detecta perfil persistente
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs').promises;

puppeteer.use(StealthPlugin());

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, text) {
  console.log(`${color}${text}${COLORS.reset}`);
}

async function main() {
  log(COLORS.cyan, '🔍 INICIANDO VERIFICACIÓN DE ANTI-DETECCIÓN...\n');

  const userDataDir = path.join(process.cwd(), 'chrome-profile');
  let browser, page;

  try {
    // ==================== CHECK 1: userDataDir ====================
    log(COLORS.blue, '✓ CHECK 1: Verificando userDataDir');
    log(COLORS.yellow, `  Perfil en: ${userDataDir}`);

    try {
      const stats = await fs.stat(userDataDir);
      if (stats.isDirectory()) {
        const files = await fs.readdir(userDataDir);
        log(COLORS.green, `  ✅ Perfil persistente encontrado (${files.length} archivos)`);
      }
    } catch (e) {
      log(COLORS.yellow, `  ℹ️  Perfil no existe aún (se creará en primera ejecución)`);
    }

    // ==================== CHECK 2: Lanzar Browser ====================
    log(COLORS.blue, '\n✓ CHECK 2: Lanzando Puppeteer con userDataDir');
    
    browser = await puppeteer.launch({
      headless: false,
      userDataDir: userDataDir,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-sync',
        '--disable-translate',
        '--enable-automation=false',
      ],
    });

    log(COLORS.green, '  ✅ Browser lanzado exitosamente');

    // ==================== CHECK 3: Crear página ====================
    log(COLORS.blue, '\n✓ CHECK 3: Evaluando propiedades de navegador');
    
    page = await browser.newPage();
    
    // Ir a una página de prueba
    await page.goto('about:blank');

    const results = await page.evaluate(() => {
      return {
        // 🔑 CRÍTICO: navigator.webdriver debe ser undefined
        webdriverDefined: typeof navigator.webdriver !== 'undefined',
        webdriverValue: navigator.webdriver,
        
        // User Agent debe ser real Chrome
        userAgent: navigator.userAgent,
        
        // Chrome object debe existir
        chromeExists: typeof window.chrome !== 'undefined',
        
        // Plugins (headless = 0, real = >0)
        pluginsCount: navigator.plugins.length,
        
        // Platform
        platform: navigator.platform,
        
        // Languages
        languages: navigator.languages?.length || 0,
        
        // WebGL info
        webglVendor: (() => {
          try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return gl?.getParameter(gl.VENDOR) || 'No disponible';
          } catch (e) {
            return 'Error al obtener';
          }
        })(),
      };
    });

    log(COLORS.yellow, '  navigator.webdriver:', results.webdriverDefined ? '❌ DETECTADO' : '✅ NO DETECTADO');
    log(COLORS.yellow, `  Chrome object: ${results.chromeExists ? '✅ Presente' : '❌ Falta'}`);
    log(COLORS.yellow, `  Plugins: ${results.pluginsCount} (headless=0, real>0)`);
    log(COLORS.yellow, `  WebGL Vendor: ${results.webglVendor}`);
    log(COLORS.yellow, `  User Agent: ${results.userAgent.substring(0, 80)}...`);

    // ==================== CHECK 4: Stealth Effectiveness ====================
    log(COLORS.blue, '\n✓ CHECK 4: Efectividad de Stealth Plugin');

    const stealthScore = await page.evaluate(() => {
      let score = 100;
      
      // Penalización por navigator.webdriver
      if (typeof navigator.webdriver !== 'undefined') {
        score -= 50;
      }
      
      // Penalización por plugins faltantes
      if (navigator.plugins.length === 0) {
        score -= 20;
      }
      
      // Penalización por userAgent sospechoso
      if (navigator.userAgent.includes('Headless')) {
        score -= 30;
      }
      if (navigator.userAgent.includes('HeadlessChrome')) {
        score -= 40;
      }
      
      // Penalización por chrome object faltante
      if (typeof window.chrome === 'undefined') {
        score -= 15;
      }
      
      return Math.max(0, score);
    });

    log(COLORS.yellow, `  Stealth Score: ${stealthScore}/100`);
    
    if (stealthScore >= 80) {
      log(COLORS.green, '  ✅ Excelente (reCAPTCHA v3 score probablemente > 0.8)');
    } else if (stealthScore >= 60) {
      log(COLORS.yellow, '  ⚠️  Aceptable (reCAPTCHA v3 score probablemente 0.5-0.8)');
    } else {
      log(COLORS.red, '  ❌ Insuficiente (reCAPTCHA v3 probablemente bloqueará)');
    }

    // ==================== CHECK 5: Profile Persistence ====================
    log(COLORS.blue, '\n✓ CHECK 5: Verificando persistencia de perfil');

    const profileFiles = await fs.readdir(userDataDir).catch(() => []);
    const criticalFiles = ['Cache', 'Cookies', 'History', 'Default'];
    const hasProfile = criticalFiles.some(file => profileFiles.includes(file));

    if (hasProfile) {
      log(COLORS.green, `  ✅ Perfil persistente activo (${profileFiles.length} archivos)`);
      log(COLORS.yellow, `  Archivos: ${profileFiles.slice(0, 5).join(', ')}...`);
    } else {
      log(COLORS.yellow, `  ℹ️  Perfil se creará en próxima ejecución`);
    }

    // ==================== RESUMEN FINAL ====================
    log(COLORS.cyan, '\n' + '='.repeat(60));
    log(COLORS.cyan, '📊 RESUMEN FINAL');
    log(COLORS.cyan, '='.repeat(60));

    const allGood = 
      !results.webdriverDefined && 
      results.chromeExists && 
      results.pluginsCount > 0 &&
      stealthScore >= 80;

    if (allGood) {
      log(COLORS.green, '\n✅ TODO ESTÁ BIEN CONFIGURADO');
      log(COLORS.green, '   reCAPTCHA v3 score esperado: 0.8-0.9+');
      log(COLORS.green, '   Posibilidad de bloqueo: BAJA\n');
    } else {
      log(COLORS.yellow, '\n⚠️  VERIFICAR CONFIGURACIÓN');
      log(COLORS.yellow, '   Algunos indicadores no están óptimos');
      log(COLORS.yellow, '   El script aún funcionará, pero con menor éxito\n');
    }

    // ==================== RECOMENDACIONES ====================
    log(COLORS.blue, '💡 RECOMENDACIONES');
    
    if (results.webdriverDefined) {
      log(COLORS.red, '  ❌ navigator.webdriver detectado - Stealth no funcionando bien');
    }
    
    if (results.pluginsCount === 0) {
      log(COLORS.yellow, '  ⚠️  0 plugins - Headless podría ser detectado');
    }
    
    if (!results.chromeExists) {
      log(COLORS.yellow, '  ⚠️  window.chrome no encontrado');
    }
    
    log(COLORS.blue, '\n  Para mejor efectividad:');
    log(COLORS.blue, '  1. Mantén la carpeta chrome-profile/ entre ejecuciones');
    log(COLORS.blue, '  2. Usa IP residencial (no datacenter/VPN)');
    log(COLORS.blue, '  3. Ejecuta el script en horarios normales');
    log(COLORS.blue, '  4. No es 100% garantizado - algunos sitios siempre bloquean');

    log(COLORS.cyan, '\n' + '='.repeat(60) + '\n');

  } catch (error) {
    log(COLORS.red, `\n❌ ERROR: ${error.message}`);
    console.error(error);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

main();
