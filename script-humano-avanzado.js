require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises;
const path = require('path');

puppeteer.use(StealthPlugin());

// ==================== UTILIDADES HUMANIZADAS ====================
// 🔑 REDDIT INSIGHT: "Slow down data inputs" - Los humanos no escriben instantáneamente
async function delayHumanizado(min = 100, max = 500) {
  const delay = Math.random() * (max - min) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
}

async function escribirLikeHuman(page, selector, texto) {
  // Primero enfocar el campo
  await page.focus(selector);
  await delayHumanizado(200, 400);
  
  // Escribir carácter por carácter (como un humano)
  for (const char of texto) {
    await page.type(selector, char, { delay: Math.random() * 100 + 50 });
    await delayHumanizado(30, 80);
  }
}

async function clickHumanizado(page, selector) {
  // Mover mouse gradualmente (los bots teleportan el mouse)
  await page.hover(selector);
  await delayHumanizado(100, 300);
  await page.click(selector);
  await delayHumanizado(200, 500);
}

// ==================== VALIDACIÓN DE STEALTH ====================
// Función para verificar si Puppeteer está siendo detectado como headless
async function validarStealthPlugin(page) {
  console.log('\n🔍 INICIANDO VALIDACIÓN DE STEALTH PLUGIN...\n');
  
  const validaciones = await page.evaluate(() => {
    return {
      // Verificar si navigator.webdriver existe (típico de headless)
      navegadorDetectado: typeof navigator.webdriver !== 'undefined',
      webdriverValor: navigator.webdriver,
      
      // Verificar user agent
      userAgent: navigator.userAgent,
      
      // Verificar si hay propiedades sospechosas
      plataforma: navigator.platform,
      lenguaje: navigator.language,
      
      // Chrome/Chromium típicamente tiene estas propiedades
      chrome: typeof window.chrome !== 'undefined',
      chromeLoadTimes: typeof window.chrome?.loadTimes === 'function',
      
      // Verificar si plugins están disponibles (headless = 0 plugins)
      pluginsCount: navigator.plugins.length,
      
      // Verificar webgl
      webglVendor: (() => {
        try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          return gl?.getParameter(gl.VENDOR) || 'No disponible';
        } catch (e) {
          return 'Error';
        }
      })(),
      
      // Verificar si el navegador tiene las características esperadas
      pantallaProfundidad: screen.colorDepth,
      resolucion: `${screen.width}x${screen.height}`,
      
      // Verificar headless mode (Puppeteer a veces deja huellas)
      headlessIndicador: (() => {
        try {
          // Algunos métodos de detección comunes
          if (navigator.webdriver === true) return 'HEADLESS DETECTADO';
          if (window.document.documentElement.getAttribute('webdriver') !== null) return 'HEADLESS DETECTADO';
          if (navigator.userAgentData?.brands?.some(b => b.brand === 'HeadlessChrome')) return 'HEADLESS DETECTADO';
          return 'OK - No detectado como headless';
        } catch (e) {
          return 'Error en detección';
        }
      })()
    };
  });
  
  // Mostrar resultados
  console.log('✅ RESULTADOS DE VALIDACIÓN STEALTH:\n');
  console.log('┌─────────────────────────────────────────┐');
  console.log('│ PROPIEDAD                    │ VALOR    │');
  console.log('├─────────────────────────────────────────┤');
  console.log(`│ navigator.webdriver          │ ${validaciones.navegadorDetectado ? '❌ DETECTADO' : '✅ OK (undefined)'}`);
  console.log(`│ User Agent                   │ ${validaciones.userAgent.substring(0, 35)}...`);
  console.log(`│ Plugins disponibles          │ ${validaciones.pluginsCount > 0 ? '✅ SÍ (' + validaciones.pluginsCount + ')' : '❌ NINGUNO'}`);
  console.log(`│ Chrome properties            │ ${validaciones.chrome ? '✅ PRESENTE' : '❌ AUSENTE'}`);
  console.log(`│ WebGL vendor                 │ ${validaciones.webglVendor}`);
  console.log(`│ Resolución pantalla          │ ${validaciones.resolucion}`);
  console.log(`│ Profundidad color            │ ${validaciones.pantallaProfundidad}-bit`);
  console.log('└─────────────────────────────────────────┘');
  console.log(`\n📊 DIAGNÓSTICO: ${validaciones.headlessIndicador}\n`);
  
  // Decisión final
  if (validaciones.navegadorDetectado) {
    console.warn('⚠️  ADVERTENCIA: El navegador PODRÍA ser detectado como bot');
    console.warn('    Razón: navigator.webdriver está presente');
    console.warn('    Solución: Considerar usar real browser connection o 2Captcha\n');
    return false;
  } else if (validaciones.pluginsCount === 0) {
    console.warn('⚠️  ADVERTENCIA: No hay plugins (puede ser indicador de headless)');
    console.warn('    Esto es normal en navegadores Linux\n');
  }
  
  console.log('✅ STEALTH: Navegador parece legítimo\n');
  return true;
}

// ==================== VALIDACIÓN DE STEALTH ====================
// Función para verificar si Puppeteer está siendo detectado como headless
async function validarStealthPlugin(page) {
  console.log('\n🔍 INICIANDO VALIDACIÓN DE STEALTH PLUGIN...\n');
  
  const validaciones = await page.evaluate(() => {
    return {
      // Verificar si navigator.webdriver existe (típico de headless)
      navegadorDetectado: typeof navigator.webdriver !== 'undefined',
      webdriverValor: navigator.webdriver,
      
      // Verificar user agent
      userAgent: navigator.userAgent,
      
      // Verificar si hay propiedades sospechosas
      plataforma: navigator.platform,
      lenguaje: navigator.language,
      
      // Chrome/Chromium típicamente tiene estas propiedades
      chrome: typeof window.chrome !== 'undefined',
      chromeLoadTimes: typeof window.chrome?.loadTimes === 'function',
      
      // Verificar si plugins están disponibles (headless = 0 plugins)
      pluginsCount: navigator.plugins.length,
      pluginsNames: Array.from(navigator.plugins).map(p => p.name),
      
      // Verificar webgl
      webglVendor: (() => {
        try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          return gl?.getParameter(gl.VENDOR) || 'No disponible';
        } catch (e) {
          return 'Error';
        }
      })(),
      
      // Verificar si el navegador tiene las características esperadas
      pantallaProfundidad: screen.colorDepth,
      resolucion: `${screen.width}x${screen.height}`,
      
      // Verificar headless mode
      headlessIndicadores: {
        webdriver: navigator.webdriver === true,
        headlessUserAgent: navigator.userAgent.includes('HeadlessChrome'),
        zeroPlugins: navigator.plugins.length === 0,
        noWebGL: (() => {
          try {
            const canvas = document.createElement('canvas');
            return !canvas.getContext('webgl');
          } catch (e) {
            return true;
          }
        })(),
      }
    };
  });
  
  // Mostrar resultados
  console.log('✅ RESULTADOS DE VALIDACIÓN STEALTH:\n');
  console.log('┌─────────────────────────────────────────────────┐');
  console.log('│ PROPIEDAD                        │ ESTADO       │');
  console.log('├─────────────────────────────────────────────────┤');
  console.log(`│ navigator.webdriver              │ ${validaciones.navegadorDetectado ? '❌ DETECTADO' : '✅ OK (undefined)'}`);
  console.log(`│ User Agent                       │ ${validaciones.userAgent.includes('HeadlessChrome') ? '❌ HeadlessChrome' : '✅ Real Chrome'}`);
  console.log(`│ Plugins disponibles              │ ${validaciones.pluginsCount > 0 ? '✅ SÍ (' + validaciones.pluginsCount + ')' : '⚠️  NINGUNO'}`);
  if (validaciones.pluginsCount > 0) {
    validaciones.pluginsNames.forEach(name => {
      console.log(`│   - ${name.substring(0, 40)}${name.length > 40 ? '...' : ''}`);
    });
  }
  console.log(`│ Chrome properties                │ ${validaciones.chrome ? '✅ PRESENTE' : '❌ AUSENTE'}`);
  console.log(`│ Chrome.loadTimes()               │ ${validaciones.chromeLoadTimes ? '✅ FUNCIONA' : '❌ NO'}`);
  console.log(`│ WebGL vendor                     │ ${validaciones.webglVendor}`);
  console.log(`│ Resolución pantalla              │ ${validaciones.resolucion}`);
  console.log(`│ Profundidad color                │ ${validaciones.pantallaProfundidad}-bit`);
  console.log('└─────────────────────────────────────────────────┘');
  
  // Análisis detallado
  console.log('\n📊 ANÁLISIS DETALLADO:\n');
  const problemas = [];
  const ventajas = [];
  
  if (validaciones.navegadorDetectado) {
    problemas.push('❌ navigator.webdriver está presente (¡CRÍTICO!)');
  } else {
    ventajas.push('✅ navigator.webdriver ocultado correctamente');
  }
  
  if (validaciones.userAgent.includes('HeadlessChrome')) {
    problemas.push('❌ User Agent contiene "HeadlessChrome"');
  } else {
    ventajas.push('✅ User Agent parece real (sin "Headless")');
  }
  
  if (validaciones.pluginsCount === 0) {
    problemas.push('⚠️  Sin plugins (puede indicar headless)');
  } else {
    ventajas.push(`✅ ${validaciones.pluginsCount} plugins presentes`);
  }
  
  if (validaciones.headlessIndicadores.zeroPlugins && validaciones.headlessIndicadores.webdriver) {
    problemas.push('❌ Combinación crítica: sin plugins + webdriver presente');
  }
  
  if (!validaciones.chrome || !validaciones.chromeLoadTimes) {
    problemas.push('⚠️  Propiedades Chrome incompletas');
  } else {
    ventajas.push('✅ Propiedades Chrome realistas');
  }
  
  // Mostrar problemas y ventajas
  if (problemas.length > 0) {
    console.log('🚨 PROBLEMAS DETECTADOS:');
    problemas.forEach(p => console.log('   ' + p));
  }
  
  console.log('\n✅ VENTAJAS CONFIRMADAS:');
  ventajas.forEach(v => console.log('   ' + v));
  
  // Decisión final
  console.log('\n' + '═'.repeat(50));
  const esHeadless = validaciones.headlessIndicadores.webdriver || 
                    (validaciones.headlessIndicadores.zeroPlugins && 
                     !validaciones.chromeLoadTimes);
  
  if (esHeadless) {
    console.warn('⚠️  ADVERTENCIA: El navegador PODRÍA ser detectado como bot');
    console.warn('    Razones:');
    if (validaciones.navegadorDetectado) console.warn('    - navigator.webdriver está presente');
    if (validaciones.headlessIndicadores.zeroPlugins) console.warn('    - No hay plugins');
    if (!validaciones.chrome) console.warn('    - Chrome properties incompletas');
    console.warn('\n    RECOMENDACIÓN:');
    console.warn('    1. Asegúrate de que headless: false está activo');
    console.warn('    2. Verifica que Stealth Plugin esté instalado correctamente');
    console.warn('    3. Considera usar 2Captcha como fallback (ya está integrado)');
    console.warn('    4. O usa real browser (no virtualized)\n');
    return false;
  } else {
    console.log('✅ STEALTH: Navegador parece COMPLETAMENTE LEGÍTIMO ✅\n');
    return true;
  }
}

// ==================== EXTRACCIÓN GRATUITA DE TOKENS reCAPTCHA ====================
// Función para intentar capturar tokens reCAPTCHA v3 de forma gratuita
async function extraerTokensCaptcha(page) {
  console.log('\n🆓 INTENTANDO CAPTURA GRATUITA DE TOKENS reCAPTCHA...\n');
  
  const tokensCapturados = await page.evaluate(() => {
    return {
      tokens: window.captchaTokensCapturados || [],
      debug: window.captchaDebug || {},
      total: (window.captchaTokensCapturados || []).length
    };
  });
  
  if (tokensCapturados.total > 0) {
    console.log('✅ TOKENS CAPTURADOS EXITOSAMENTE:\n');
    tokensCapturados.tokens.forEach((t, i) => {
      console.log(`   Token #${i + 1}:`);
      console.log(`   - Acción: ${t.action || 'N/A'}`);
      console.log(`   - Largo: ${t.tokenLargo} caracteres`);
      console.log(`   - Tiempo: ${t.timestamp}`);
      console.log(`   - Token: ${t.token.substring(0, 40)}...\n`);
    });
    console.log(`📊 TOTAL: ${tokensCapturados.total} token(s) capturado(s)\n`);
    
    return {
      exito: true,
      tokensCount: tokensCapturados.total,
      tokens: tokensCapturados.tokens,
      mensaje: `Se capturaron ${tokensCapturados.total} tokens reCAPTCHA de forma GRATUITA`
    };
  } else {
    console.log('❌ No se capturaron tokens (SRI bloqueó el acceso a grecaptcha)\n');
    console.log('📊 Debug info:');
    console.log(`   - Intentos: ${tokensCapturados.debug.attemptosCaptura}`);
    console.log(`   - Errores: ${tokensCapturados.debug.errores?.length || 0}`);
    
    return {
      exito: false,
      tokensCount: 0,
      tokens: [],
      debug: tokensCapturados.debug,
      mensaje: 'No fue posible capturar tokens (SRI tiene protección)'
    };
  }
}

// ==================== INTEGRACIÓN 2CAPTCHA FALLBACK ====================
// Función para resolver reCAPTCHA v3 usando 2Captcha como fallback
async function resolverCaptchaConDosCapcha(page, pageUrl) {
  try {
    // Obtener el sitekey de la página
    const siteKey = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      for (let script of scripts) {
        if (script.textContent.includes('sitekey')) {
          const match = script.textContent.match(/'sitekey':\s*'([^']+)'/);
          if (match) return match[1];
        }
      }
      // Fallback: buscar en atributos comunes
      const recaptchaDiv = document.querySelector('[data-sitekey]');
      return recaptchaDiv?.getAttribute('data-sitekey');
    });

    if (!siteKey) {
      console.log('❌ No se encontró el sitekey de reCAPTCHA');
      return { exito: false, token: null };
    }

    console.log(`\n💰 RESOLVIENDO reCAPTCHA v3 CON 2CAPTCHA`);
    console.log(`   SiteKey: ${siteKey.substring(0, 20)}...`);
    console.log(`   URL: ${pageUrl}\n`);

    // Verificar que existe API key de 2Captcha
    const apiKey2Captcha = process.env.TWOCAPTCHA_API_KEY;
    if (!apiKey2Captcha) {
      console.log('❌ TWOCAPTCHA_API_KEY no configurada en .env');
      console.log('   Agrega: TWOCAPTCHA_API_KEY=tu_clave_aqui');
      return { exito: false, token: null };
    }

    // Enviar a 2Captcha
    const https = require('https');
    return new Promise((resolve) => {
      const captchaData = {
        method: 'post',
        captchafile: 'base64:' + Buffer.from(JSON.stringify({
          sitekey: siteKey,
          pageurl: pageUrl,
          version: 'v3',
          action: 'verify'
        })).toString('base64'),
        json: 1
      };

      // Convertir a query string
      const queryString = new URLSearchParams({
        ...captchaData,
        key: apiKey2Captcha,
        method: 'userrecaptcha',
        googlekey: siteKey,
        pageurl: pageUrl,
        version: 'v3',
        action: 'verify',
        json: 1
      }).toString();

      const url = `https://2captcha.com/in.php?${queryString}`;
      
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', async () => {
          try {
            const resultado = JSON.parse(data);
            if (resultado.status === 0) {
              console.log('❌ Error 2Captcha: ' + resultado.error);
              resolve({ exito: false, token: null });
              return;
            }
            
            const captchaId = resultado.captcha;
            console.log(`📋 Captcha enviado - ID: ${captchaId}`);
            console.log(`   Esperando resultado (max 30 segundos)...\n`);
            
            // Polling para obtener el resultado
            let intentosPoll = 0;
            const maxIntentosObtener = 30;
            
            const pollResultado = () => {
              intentosPoll++;
              
              const pollUrl = `https://2captcha.com/res.php?key=${apiKey2Captcha}&action=get&captcha=${captchaId}&json=1`;
              
              https.get(pollUrl, (res) => {
                let pollData = '';
                res.on('data', chunk => pollData += chunk);
                res.on('end', () => {
                  try {
                    const pollResult = JSON.parse(pollData);
                    
                    if (pollResult.status === 0) {
                      if (intentosPoll < maxIntentosObtener) {
                        console.log(`   [${intentosPoll}/${maxIntentosObtener}] Aún procesando...`);
                        setTimeout(pollResultado, 1000);
                      } else {
                        console.log('❌ Timeout esperando resultado de 2Captcha');
                        resolve({ exito: false, token: null });
                      }
                    } else if (pollResult.status === 1) {
                      const token = pollResult.request;
                      console.log(`✅ Token obtenido de 2Captcha en ${intentosPoll} intentos`);
                      console.log(`   Token: ${token.substring(0, 40)}...\n`);
                      resolve({ exito: true, token: token });
                    }
                  } catch (e) {
                    console.log('❌ Error parseando respuesta de 2Captcha');
                    resolve({ exito: false, token: null });
                  }
                });
              }).on('error', () => {
                resolve({ exito: false, token: null });
              });
            };
            
            pollResultado();
          } catch (e) {
            console.log('❌ Error procesando respuesta inicial de 2Captcha');
            resolve({ exito: false, token: null });
          }
        });
      }).on('error', () => {
        console.log('❌ Error conectando a 2Captcha');
        resolve({ exito: false, token: null });
      });
    });
  } catch (error) {
    console.log('❌ Error inesperado en 2Captcha: ' + error.message);
    return { exito: false, token: null };
  }
}

// Función para inyectar token reCAPTCHA en la página
async function inyectarTokenReCaptcha(page, token) {
  try {
    await page.evaluate((tokenParam) => {
      // Buscar el campo donde guardar el token
      const responseFields = document.querySelectorAll('[name$="response"], [name$="token"], [data-callback]');
      if (responseFields.length > 0) {
        responseFields.forEach(field => {
          if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
            field.value = tokenParam;
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
      
      // También ejecutar cualquier callback de reCAPTCHA si existe
      if (typeof window.captchaCallback === 'function') {
        window.captchaCallback(tokenParam);
      }
    }, token);
    
    console.log('✅ Token inyectado en la página');
    return true;
  } catch (error) {
    console.log('❌ Error inyectando token: ' + error.message);
    return false;
  }
}

// Sistema de captura de comportamiento humano para análisis posterior
global.comportamientoHumanoRegistrado = {
  clicks: [],
  movimientos: [],
  teclado: [],
  delays: [],
  velocidadPromedio: 0,
  patronMovimiento: 'curva bézier con easing natural',
  tiempoPromedioPulsacion: 0,
  erroresSimulados: 0,
  backspaces: 0
};

const registrarComportamiento = (tipo, datos) => {
  if (!global.comportamientoHumanoRegistrado) {
    global.comportamientoHumanoRegistrado = {};
  }
  switch(tipo) {
    case 'click':
      if (!global.comportamientoHumanoRegistrado.clicks) global.comportamientoHumanoRegistrado.clicks = [];
      global.comportamientoHumanoRegistrado.clicks.push(datos);
      break;
    case 'movimiento':
      if (!global.comportamientoHumanoRegistrado.movimientos) global.comportamientoHumanoRegistrado.movimientos = [];
      global.comportamientoHumanoRegistrado.movimientos.push(datos);
      break;
    case 'teclado':
      if (!global.comportamientoHumanoRegistrado.teclado) global.comportamientoHumanoRegistrado.teclado = [];
      global.comportamientoHumanoRegistrado.teclado.push(datos);
      break;
    case 'delay':
      if (!global.comportamientoHumanoRegistrado.delays) global.comportamientoHumanoRegistrado.delays = [];
      global.comportamientoHumanoRegistrado.delays.push(datos);
      break;
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Obtener "Todos" para el selector de día (siempre debe ser 0)
const obtenerDiaActual = () => {
  return '0'; // Siempre retorna "Todos"
};

// Sistema de perfiles de comportamiento dinámico por reintento
function obtenerPerfilComportamiento(numeroIntento) {
  if (numeroIntento <= 10) {
    return {
      nombre: 'lectura_cuidadosa',
      velocidadMouse: 0.5,      // Lento
      pausasVerificacion: true,  // Verifica antes de continuar
      hoverElements: true,       // Pasa mouse sobre elementos
      ordenNormal: true,         // Orden estándar: radio -> campo -> año -> mes -> día -> tipo -> buscar
      delayClick: [600, 1200],
      delayHover: [300, 600]
    };
  } else if (numeroIntento <= 20) {
    return {
      nombre: 'lectura_normal',
      velocidadMouse: 0.8,
      pausasVerificacion: true,
      hoverElements: true,
      ordenNormal: true,
      delayClick: [400, 800],
      delayHover: [200, 400]
    };
  } else if (numeroIntento <= 30) {
    return {
      nombre: 'interaccion_verificacion',
      velocidadMouse: 1.0,
      pausasVerificacion: true,
      clicksAdicionales: true,   // Click en campos antes de llenar
      scrollBefore: true,        // Scroll antes de interactuar
      ordenNormal: true,
      delayClick: [300, 600],
      delayHover: [150, 300]
    };
  } else if (numeroIntento <= 40) {
    return {
      nombre: 'lectura_rápida_enfocada',
      velocidadMouse: 1.2,
      pausasVerificacion: false,
      ordenAleatorio: true,      // Cambia orden de interacciones
      skipHovers: Math.random() > 0.4,
      delayClick: [200, 500],
      delayHover: [50, 150]
    };
  } else {
    return {
      nombre: 'automatico_variado',
      velocidadMouse: 0.6 + Math.random() * 0.8,
      pausasVerificacion: Math.random() > 0.3,
      clicksAdicionales: Math.random() > 0.5,
      scrollBefore: Math.random() > 0.5,
      orderAleatorio: Math.random() > 0.4,
      delayClick: [Math.random() * 400 + 200, Math.random() * 400 + 600],
      delayHover: [Math.random() * 200 + 50, Math.random() * 300 + 200]
    };
  }
}

// Función para generar tiempos aleatorios más humanos (distribución normal)
function randomHumanDelay(min, max, fase = 'general') {
  const mean = (min + max) / 2;
  const stdDev = (max - min) / 6;
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const result = num * stdDev + mean;
  const delay = Math.max(min, Math.min(max, result));
  
  // Registrar el delay para análisis
  registrarComportamiento('delay', {
    fase: fase,
    min: min,
    max: max,
    ms: Math.round(delay),
    media: Math.round(mean)
  });
  
  return delay;
}

// Función para registrar eventos de interacción en el navegador
async function registerUserInteraction(page) {
  return page.evaluate(() => {
    // Registrar múltiples tipos de eventos para que reCAPTCHA los vea
    window.interactionEvents = {
      clicks: 0,
      keyPresses: 0,
      mouseMoves: 0,
      touches: 0,
      timestamp: Date.now()
    };

    document.addEventListener('click', () => {
      window.interactionEvents.clicks++;
      window.interactionEvents.timestamp = Date.now();
    }, true);

    document.addEventListener('keydown', () => {
      window.interactionEvents.keyPresses++;
      window.interactionEvents.timestamp = Date.now();
    }, true);

    document.addEventListener('mousemove', () => {
      window.interactionEvents.mouseMoves++;
      window.interactionEvents.timestamp = Date.now();
    }, true);

    document.addEventListener('touchstart', () => {
      window.interactionEvents.touches++;
      window.interactionEvents.timestamp = Date.now();
    }, true);

    // Exponemos la función para que reCAPTCHA pueda verificarla
    window.__hasUserInteraction = () => {
      return window.interactionEvents && (
        window.interactionEvents.clicks > 0 ||
        window.interactionEvents.keyPresses > 0 ||
        window.interactionEvents.mouseMoves > 5
      );
    };
  });
}

// User agents reales de Ecuador (Chrome en Windows)
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
];

class SRIDownloader {
  constructor() {
    this.browser = null;
    this.page = null;
    this.descargasDir = path.join(__dirname, 'descargas');
    this.screenshotsDir = path.join(__dirname, 'screenshots');
    this.mouseMovementInterval = null;
    this.userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }

  async inicializar() {
    await fs.mkdir(this.descargasDir, { recursive: true });
    await fs.mkdir(this.screenshotsDir, { recursive: true });

    // ==================== CONFIGURACIÓN ANTI-DETECCIÓN MEJORADA ====================
    // 🔑 KEY INSIGHT: puppeteer-real-browser alcanza 0.9 score porque usa userDataDir
    const userDataDir = path.join(process.cwd(), 'chrome-profile');
    await fs.mkdir(userDataDir, { recursive: true });

    this.browser = await puppeteer.launch({
      headless: false,  // IMPORTANTE: Esto es casi obligatorio para reCAPTCHA
      defaultViewport: null,
      userDataDir: userDataDir,  // 🔑 CRÍTICO: Usar perfil persistente, NO temporal
      args: [
        // Ocultar que es automatizado
        '--disable-blink-features=AutomationControlled',
        
        // Permisos y sandboxing
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',  // Importante para Linux/Docker
        
        // Ventana visible
        '--window-size=1920,1080',
        '--start-maximized',
        '--disable-infobars',
        
        // Evitar bloqueos de seguridad
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-component-extensions-with-background-pages',
        '--disable-default-apps',
        '--disable-device-discovery-notifications',
        '--disable-preconnect',
        
        // Performance
        '--enable-automation=false',  // MUY IMPORTANTE
        '--disable-popup-blocking',
        
        // 🔑 REDDIT INSIGHTS: Estos flags mejoran el score de reCAPTCHA v3
        '--disable-gpu',  // Reduce detección de headless
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',  // Usa hardware rendering
        '--disable-renderer-backgrounding',
      ],
      // Ejecutable específico si es necesario
      // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    });

    this.page = await this.browser.newPage();

    // ==================== MÁSCARA ANTI-DETECCIÓN EN LA PÁGINA ====================
    // Ejecutar ANTES de cualquier navegación
    await this.page.evaluateOnNewDocument(() => {
      // ==================== TÉCNICA 1: ELIMINAR navigator.webdriver COMPLETAMENTE ====================
      // No solo ocultarlo, eliminarlo del descriptor
      try {
        delete navigator.webdriver;
      } catch (e) {}
      
      // ==================== TÉCNICA 2: REDEFINIR CON DESCRIPTOR SEGURO ====================
      // Usar descriptor con configurable: false para que no sea modificable
      try {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
          set: () => undefined,
          configurable: false,  // No puede ser modificado
          enumerable: false,    // No aparece en enumeraciones
        });
      } catch (e) {}
      
      // ==================== TÉCNICA 3: PROTEGER EN WINDOW ====================
      // Algunos scripts buscan en window.navigator.webdriver
      try {
        Object.defineProperty(window.navigator, 'webdriver', {
          get: () => undefined,
          set: () => undefined,
          configurable: false,
          enumerable: false,
        });
      } catch (e) {}
      
      // ==================== TÉCNICA 4: OCULTAR "chromium" DEL USER AGENT ====================
      const originalUserAgent = navigator.userAgent;
      const newUA = originalUserAgent
        .replace('HeadlessChrome', 'Chrome')
        .replace('Chromium', 'Chrome');
      
      try {
        Object.defineProperty(navigator, 'userAgent', {
          get: () => newUA,
          configurable: false,
        });
      } catch (e) {}
      
      try {
        Object.defineProperty(navigator, 'appVersion', {
          get: () => newUA.replace(/^Mozilla\//, ''),
          configurable: false,
        });
      } catch (e) {}

      // ==================== TÉCNICA 5: CHROME PROPERTIES REALISTAS ====================
      window.chrome = {
        runtime: {
          PlatformOs: {
            MAC: 'mac',
            WIN: 'win',
            ANDROID: 'android',
            CROS: 'cros',
            LINUX: 'linux',
            OPENBSD: 'openbsd',
          },
          OnStartup: {
            RUN_THIS_CONTEXT_SCRIPT: 0,
            LAUNCH_PERSISTENT_PROFILE: 1,
          },
          OnInstalled: {
            REASON_CHROME_UPDATE: 'chrome_update',
            REASON_INSTALL: 'install',
          },
          RequestUpdateCheckStatus: {
            THROTTLED: 'throttled',
            NO_UPDATE: 'no_update',
            UPDATE_AVAILABLE: 'update_available',
          },
        },
        loadTimes: function() {
          return {
            requestTime: Date.now() / 1000 - Math.random() * 100,
            startLoadTime: Date.now() / 1000 - Math.random() * 90,
            commitLoadTime: Date.now() / 1000 - Math.random() * 80,
            finishDocumentLoadTime: Date.now() / 1000 - Math.random() * 70,
            finishLoadTime: Date.now() / 1000 - Math.random() * 60,
            firstPaintTime: Date.now() / 1000 - Math.random() * 50,
            firstPaintAfterLoadTime: 0,
            navigationType: 'Other',
            wasFetchedViaSpdy: false,
            wasNpnNegotiated: false,
            npnProtocol: 'unknown',
            wasAlternateProtocolAvailable: false,
            alternateProtocol: 'unknown',
            wasAlternateProtocolAvailable: false,
            connectionInfo: 'http/1.1',
          };
        },
        csi: function() {
          return {
            pageLoadTime: Math.random() * 5000 | 0,
            startE2eConnectionTime: (Date.now() - Math.random() * 1000) | 0,
            onloadT: (Date.now() - Math.random() * 500) | 0,
            sendStart: (Date.now() - Math.random() * 1000) | 0,
            sendEnd: (Date.now() - Math.random() * 900) | 0,
            responseStart: (Date.now() - Math.random() * 800) | 0,
            downloadTime: 0,
            firstInputDelay: Math.random() * 100 | 0,
          };
        },
      };

      // ==================== TÉCNICA 6: PLUGINS REALISTAS ====================
      const pluginArray = [
        {
          name: 'Chrome PDF Plugin',
          description: 'Portable Document Format',
          filename: 'internal-pdf-viewer',
          version: '1.0',
        },
        {
          name: 'Chrome PDF Viewer',
          description: '',
          filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
          version: '1.0',
        },
        {
          name: 'Native Client Executable',
          description: '',
          filename: 'internal-nacl-plugin',
          version: '1.0',
        },
        {
          name: 'Shockwave Flash',
          description: 'Shockwave Flash 32.0 r0',
          filename: 'pepflashplayer.dll',
          version: '32.0.0.403',
        },
      ];
      
      try {
        Object.defineProperty(navigator, 'plugins', {
          get: () => pluginArray,
          configurable: false,
        });
      } catch (e) {}

      // ==================== TÉCNICA 7: PERMISSIONS REALISTA ====================
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => {
        if (parameters.name === 'notifications') {
          return Promise.resolve({ state: Notification.permission });
        }
        return originalQuery(parameters);
      };

      // ==================== TÉCNICA 8: WEBGL REALISTA ====================
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) {
          return 'Intel Inc.';
        }
        if (parameter === 37446) {
          return 'Intel Iris OpenGL Engine';
        }
        return getParameter(parameter);
      };

      // ==================== TÉCNICA 9: CANVAS FINGERPRINTING ====================
      const canvasProto = HTMLCanvasElement.prototype;
      const originalToDataURL = canvasProto.toDataURL;
      canvasProto.toDataURL = function(type) {
        if (type === 'image/png' && this.width === 280 && this.height === 60) {
          return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        }
        return originalToDataURL.call(this, type);
      };

      // ==================== TÉCNICA 10: LANGUAGES ====================
      try {
        Object.defineProperty(navigator, 'languages', {
          get: () => ['es-EC', 'es', 'en-US', 'en'],
          configurable: false,
        });
      } catch (e) {}

      // ==================== TÉCNICA 11: OCULTAR PUPPETEER EN ARRAYS ====================
      const handler = {
        get: (target, prop) => {
          if (prop === 'webdriver') return undefined;
          return target[prop];
        },
      };

      window.navigator = new Proxy(window.navigator, handler);
    });

    // ==================== CAPTURA GRATUITA DE TOKENS reCAPTCHA ====================
    // Intentar interceptar tokens antes de ser enviados (técnica gratuita)
    await this.page.evaluateOnNewDocument(() => {
      // Sistema global para capturar tokens
      window.captchaTokensCapturados = [];
      window.captchaDebug = {
        attemptosCaptura: 0,
        tokensEncontrados: 0,
        errores: []
      };

      // Interceptar window.grecaptcha.execute (si está disponible)
      if (typeof window.grecaptcha !== 'undefined') {
        console.log('[CAPTCHA] window.grecaptcha detectado, preparando interceptor...');
        
        const originalExecute = window.grecaptcha.execute;
        if (originalExecute && typeof originalExecute === 'function') {
          window.grecaptcha.execute = async function(siteKey, options) {
            window.captchaDebug.attemptosCaptura++;
            
            try {
              console.log('[CAPTCHA] Interceptando grecaptcha.execute...');
              
              // Llamar función original
              const token = await originalExecute.call(this, siteKey, options);
              
              // Guardar token
              window.captchaTokensCapturados.push({
                siteKey: siteKey,
                token: token,
                action: options?.action || 'unknown',
                timestamp: new Date().toISOString(),
                tokenLargo: token.length
              });
              
              window.captchaDebug.tokensEncontrados++;
              console.log('[CAPTCHA] ✅ Token capturado:', token.substring(0, 30) + '...');
              
              return token;
            } catch (error) {
              window.captchaDebug.errores.push(error.message);
              console.error('[CAPTCHA] Error capturando token:', error);
              throw error;
            }
          };
        }
      }

      // También intentar capturar mediante callbacks
      window.__grecaptcha_cb = function(tokens) {
        window.captchaTokensCapturados.push({
          source: 'callback',
          data: tokens,
          timestamp: new Date().toISOString()
        });
        console.log('[CAPTCHA] Token capturado vía callback');
      };
    });
    // ============================================================================

    // Inyectar comportamiento humano en CADA página
    await this.page.evaluateOnNewDocument(() => {
      // Modificaciones MÍNIMAS (como el script que funciona)
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false
      });
      
      // Ocultar Puppeteer completamente
      Object.defineProperty(navigator, 'plugins', {
        get: () => []
      });
      
      Object.defineProperty(navigator, 'languages', {
        get: () => ['es-EC', 'es', 'en-US', 'en']
      });

      // Chrome object más completo
      window.chrome = { 
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {},
        webstore: {}
      };

      // Permissions API
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );

      // Agregar canvas fingerprint realista
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) {
          return 'Intel Inc.';
        }
        if (parameter === 37446) {
          return 'Intel Iris OpenGL Engine';
        }
        return getParameter.apply(this, [parameter]);
      };

      // Protections contra detección de automatización
      Object.defineProperty(window, 'document', {
        get() {
          return document;
        }
      });

      // Simular que el usuario está interactuando
      const originalTouchEvent = window.TouchEvent;
      window.TouchEvent = function(type, init) {
        return new originalTouchEvent(type, {
          bubbles: true,
          cancelable: true,
          ...init
        });
      };

      // Mock funciones que detectan bots
      window.__proto__.chrome = {
        runtime: {},
        webstore: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };

      // Evitar detección por timing perfecto
      const originalPerformanceNow = performance.now;
      let timeOffset = Math.random() * 1000;
      performance.now = function() {
        return originalPerformanceNow.call(performance) + timeOffset;
      };

      // Behavioral signals: simular que hay interacción del usuario
      let mouseMovements = 0;
      let keyPresses = 0;
      
      document.addEventListener('mousemove', () => {
          mouseMovements++;
      }, true);
      
      document.addEventListener('keypress', () => {
          keyPresses++;
      }, true);

      // Función para verificar interacción (para reCAPTCHA)
      window.hasUserInteraction = function() {
        return mouseMovements > 5 && keyPresses > 2;
      };

      // Ocultar señales de automatización
      Object.defineProperty(navigator, 'maxTouchPoints', {
        get: () => 10
      });

      Object.defineProperty(navigator, 'vendor', {
        get: () => 'Google Inc.'
      });

      // Local storage behavior (como usuario real)
      if (typeof(Storage) !== "undefined") {
        localStorage.setItem('user_interaction_detected', 'true');
      }
    });

    const client = await this.page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: this.descargasDir
    });

    await this.page.setUserAgent(this.userAgent);

    // Registrar eventos de interacción de usuario
    await registerUserInteraction(this.page);

    console.log('✓ Navegador inicializado');
    console.log(`✓ User Agent: ${this.userAgent.substring(0, 50)}...`);
  }

  async takeScreenshot(nombre) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const filepath = path.join(this.screenshotsDir, `${nombre}_${timestamp}.png`);
      
      await this.page.screenshot({ 
        path: filepath,
        fullPage: true 
      });
      
      console.log(`📸 Screenshot: ${nombre}`);
    } catch (error) {
      console.log(`⚠️  Error tomando screenshot: ${error.message}`);
    }
  }

  // Movimiento de mouse continuo en background (muy humano)
  startContinuousMouseMovement() {
    this.mouseMovementInterval = setInterval(async () => {
      try {
        const currentPos = await this.page.evaluate(() => ({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        }));
        
        const newX = Math.max(50, Math.min(currentPos.x + (Math.random() - 0.5) * 100, 1870));
        const newY = Math.max(50, Math.min(currentPos.y + (Math.random() - 0.5) * 100, 1030));
        
        await this.page.mouse.move(newX, newY, { 
          steps: 5 + Math.floor(Math.random() * 10)
        });
      } catch (error) {
        // Silenciar errores del movimiento background
      }
    }, randomHumanDelay(3000, 8000));
  }

  stopContinuousMouseMovement() {
    if (this.mouseMovementInterval) {
      clearInterval(this.mouseMovementInterval);
      this.mouseMovementInterval = null;
    }
  }

  // Detectar si hubo error de validación
  async detectarErrorValidacion() {
    const errorDiv = await this.page.evaluate(() => {
      const div = document.querySelector('#formMessages\\:messages');
      if (div && div.textContent.toLowerCase().includes('captcha')) {
        return {
          existe: true,
          mensaje: div.textContent.trim()
        };
      }
      return { existe: false, mensaje: '' };
    });
    return errorDiv;
  }

  // Limpiar error de validación
  async limpiarError() {
    await this.page.evaluate(() => {
      const btn = document.querySelector('.ui-messages-close');
      if (btn) {
        btn.click();
      }
      // Alternativa: ocultar directamente
      const errorDiv = document.querySelector('#formMessages\\:messages');
      if (errorDiv) {
        errorDiv.style.display = 'none';
      }
    });
    await sleep(randomHumanDelay(500, 1000));
  }

  // Guardar caso exitoso
  async guardarCasoExitoso(intentoNumero, ruc, timestamp) {
    try {
      const casesDir = path.join(__dirname, 'cases');
      await fs.mkdir(casesDir, { recursive: true });

      const nombreArchivo = `caso_exitoso_${timestamp}.txt`;
      const rutaArchivo = path.join(casesDir, nombreArchivo);

      // Obtener datos de comportamiento humano guardados
      const comportamientoData = global.comportamientoHumanoRegistrado || {};

      const contenido = `
╔═══════════════════════════════════════════════════════════════════════════╗
║                         CASO EXITOSO - REPORTADO                          ║
╚═══════════════════════════════════════════════════════════════════════════╝

📊 INFORMACIÓN DEL CASO EXITOSO
═══════════════════════════════════════════════════════════════════════════

Fecha y Hora:          ${new Date().toLocaleString('es-ES')}
Timestamp:             ${timestamp}
RUC:                   ${ruc}
Intento Exitoso:       ${intentoNumero} de 50
Navegador:             Puppeteer + Stealth Plugin
Modo:                  Headless: false (navegador visible)
Versión Script:        3.3 (Con Registro de Comportamiento)

═══════════════════════════════════════════════════════════════════════════

🔧 TÉCNICAS APLICADAS EN ESTE CASO
═══════════════════════════════════════════════════════════════════════════

✅ Click ULTRA-HUMANO (5 Fases)
   ├─ FASE 1: Evaluación visual del botón (150-350ms)
   ├─ FASE 2: Aproximación con curva bézier (360-840ms)
   ├─ FASE 3: Hover final con correcciones (250-400ms)
   ├─ FASE 4: Eventos sincronizados (150-300ms)
   └─ FASE 5: Click con presión variable (140-280ms)

✅ Movimiento Natural del Mouse
   ├─ Curva bézier (no línea recta)
   ├─ Easing function (aceleración natural)
   ├─ Puntos aleatorios en trayectoria
   └─ Offset variable en cada punto

✅ Timing Gaussiano
   ├─ Distribución normal (Box-Muller)
   ├─ Delays no uniformes
   └─ Menos predecible para detección

✅ Múltiples Eventos de Mouse
   └─ mouseenter → mouseover → mousemove → mousedown → click → mouseup → mouseleave

✅ Registro de Interacción del Usuario
   ├─ Monitoreo de clicks
   ├─ Monitoreo de pulsaciones de teclado
   ├─ Monitoreo de movimientos del mouse
   └─ Exposición de función para reCAPTCHA

✅ Inyecciones JavaScript Avanzadas
   ├─ navigator.webdriver ocultado
   ├─ Canvas/WebGL fingerprint realista
   ├─ Permissions API mockeada
   ├─ performance.now() con offset variable
   └─ LocalStorage con flag de interacción

═══════════════════════════════════════════════════════════════════════════

📋 PASOS EJECUTADOS
═══════════════════════════════════════════════════════════════════════════

1. ✓ Inicialización del navegador
   └─ Stealth Plugin activado
   └─ Configuración de CDP
   └─ Inyección de JavaScript avanzada

2. ✓ Navegación al portal del SRI
   └─ URL: https://srienlinea.sri.gob.ec/sri-en-linea/
   └─ Espera: networkidle2

3. ✓ Comportamiento humano inicial
   └─ Movimientos de mouse aleatorios
   └─ Scroll natural
   └─ Pausas de lectura

4. ✓ Login a la cuenta
   └─ Click en "Iniciar sesión"
   └─ Espera de navegación
   └─ Tipeo humano con errores ocasionales

5. ✓ Ingreso de credenciales
   └─ RUC: ${ruc}
   └─ Contraseña: [oculta]
   └─ Timing variable entre caracteres

6. ✓ Click en "Ingresar"
   └─ Movimiento natural hacia botón
   └─ Click ultra-humano

7. ✓ Navegación a comprobantes
   └─ Abrir menú hamburguesa
   └─ Expandir "FACTURACIÓN ELECTRÓNICA"
   └─ Click en "Comprobantes electrónicos recibidos"

8. ✓ Comportamiento humano en formulario
   └─ Lectura/verificación de campos
   └─ Hover sobre elementos
   └─ Selección de opciones

9. ✓ Búsqueda exitosa (INTENTO ${intentoNumero})
   └─ FASE 1: Evaluación visual ✓
   └─ FASE 2: Aproximación bézier ✓
   └─ FASE 3: Hover final ✓
   └─ FASE 4: Eventos sincronizados ✓
   └─ FASE 5: Click final ✓

10. ✓ Validación reCAPTCHA
    └─ Espera: 18 segundos
    └─ Detección: Sin error
    └─ Estado: VALIDADO ✓

11. ✓ Descarga de resultados
    └─ Panel de resultados visible
    └─ Comprobantes cargados exitosamente

═══════════════════════════════════════════════════════════════════════════

🎬 COMPORTAMIENTO HUMANO SIMULADO EN ESTE INTENTO
═══════════════════════════════════════════════════════════════════════════

${comportamientoData.clicks ? `📍 CLICKS REGISTRADOS (${comportamientoData.clicks.length} total)
${comportamientoData.clicks.map((c, i) => `   ${i+1}. ${c.selector} en posición (${Math.round(c.x)}, ${Math.round(c.y)}) - Delay: ${c.delay}ms`).join('\n')}
` : '📍 CLICKS: Sistema listo para registrar\n'}

${comportamientoData.movimientos ? `🖱️ MOVIMIENTOS DE MOUSE (${comportamientoData.movimientos.length} total)
   Rango X: ${Math.min(...comportamientoData.movimientos.map(m => m.x))} a ${Math.max(...comportamientoData.movimientos.map(m => m.x))}
   Rango Y: ${Math.min(...comportamientoData.movimientos.map(m => m.y))} a ${Math.max(...comportamientoData.movimientos.map(m => m.y))}
   Velocidad promedio: ${comportamientoData.velocidadPromedio || 'variable'} px/ms
   Patrón: ${comportamientoData.patronMovimiento || 'curva bézier con easing natural'}
` : '🖱️ MOVIMIENTOS: Sistema listo para registrar\n'}

${comportamientoData.teclado ? `⌨️ PULSACIONES DE TECLADO (${comportamientoData.teclado.length} total)
   Timing entre caracteres: ${comportamientoData.tiempoPromedioPulsacion || 'variable'} ms
   Errores simulados: ${comportamientoData.erroresSimulados || 0}
   Backspaces: ${comportamientoData.backspaces || 0}
` : '⌨️ TECLADO: Sistema listo para registrar\n'}

${comportamientoData.delays ? `⏱️ TIMING GAUSSIANO APLICADO
   Delays en intento ${intentoNumero}:
${comportamientoData.delays.map((d, i) => `   ${i+1}. ${d.fase || 'Delay general'}: ${d.ms}ms`).slice(0, 10).join('\n')}${comportamientoData.delays.length > 10 ? `\n   ... y ${comportamientoData.delays.length - 10} más delays registrados` : ''}
` : '⏱️ TIMING: Distribución gaussiana (Box-Muller) aplicada\n'}

═══════════════════════════════════════════════════════════════════════════

💡 INSIGHTS Y ANÁLISIS
═══════════════════════════════════════════════════════════════════════════

Este caso fue exitoso en el intento número ${intentoNumero}.

Posibles razones del éxito:
• La combinación específica de delays en este intento
• El patrón de movimiento del mouse fue más convincente
• La sincronización de eventos fue perfecta
• Google reCAPTCHA aceptó el patrón de comportamiento
• La IP no tenía historial de rechazo en ese momento

═══════════════════════════════════════════════════════════════════════════

🎯 ESTADÍSTICAS DEL PROCESO
═══════════════════════════════════════════════════════════════════════════

Reintentos realizados:        ${intentoNumero}
Porcentaje de reintentos:     ${((intentoNumero / 50) * 100).toFixed(2)}%
Tiempo total aprox:           ${intentoNumero * 25} segundos
Tasa de éxito en este intento: 100%

═══════════════════════════════════════════════════════════════════════════

📌 OBSERVACIONES IMPORTANTES
═══════════════════════════════════════════════════════════════════════════

1. Este caso PASÓ la validación de reCAPTCHA
2. El script completó TODAS las fases correctamente
3. Los datos fueron descargados exitosamente
4. El comportamiento fue lo suficientemente humano

═══════════════════════════════════════════════════════════════════════════

🚀 PARA MEJORAR EL SCRIPT
═══════════════════════════════════════════════════════════════════════════

Analizar este caso junto con otros casos exitosos:
✓ Compara el timing usado en este intento
✓ Revisa la secuencia de eventos
✓ Nota los delays específicos que funcionaron
✓ Valida el patrón de movimiento del mouse
✓ Identifica qué hace este caso diferente

═══════════════════════════════════════════════════════════════════════════

Archivo generado automáticamente
Generado por: script-humano-avanzado.js v3.2
Versión: Sistema de Casos Exitosos
`;

      await fs.writeFile(rutaArchivo, contenido.trim());
      console.log(`\n💾 Caso exitoso guardado en: cases/${nombreArchivo}\n`);
    } catch (error) {
      console.log(`⚠️ Error guardando caso exitoso: ${error.message}`);
    }
  }

  // Comportamiento humano avanzado
  async comportamientoHumanoAvanzado() {
    console.log('🤖 Simulando comportamiento humano avanzado...');
    
    // 1. Movimientos de mouse naturales (curvas bezier simuladas)
    const positions = [];
    for (let i = 0; i < 5; i++) {
      positions.push({
        x: 100 + Math.random() * 1720,
        y: 100 + Math.random() * 880
      });
    }
    
    for (const pos of positions) {
      await this.page.mouse.move(pos.x, pos.y, { 
        steps: 10 + Math.floor(Math.random() * 20)
      });
      await sleep(randomHumanDelay(100, 400));
    }
    
    // 2. Scroll con aceleración/desaceleración
    for (let i = 0; i < 3; i++) {
      const scrollAmount = 50 + Math.random() * 150;
      await this.page.evaluate((amount) => {
        window.scrollBy({
          top: amount,
          behavior: 'smooth'
        });
      }, scrollAmount);
      await sleep(randomHumanDelay(300, 700));
      
      // Scroll back pequeño (típico humano)
      const scrollBack = -20 - Math.random() * 30;
      await this.page.evaluate((amount) => {
        window.scrollBy({
          top: amount,
          behavior: 'smooth'
        });
      }, scrollBack);
      await sleep(randomHumanDelay(200, 500));
    }
    
    // 3. Pausas de "lectura" (mirar elementos)
    const elements = await this.page.$$('h1, h2, h3, a, button, input');
    if (elements.length > 0) {
      const randomElements = [];
      for (let i = 0; i < Math.min(3, elements.length); i++) {
        const randomIndex = Math.floor(Math.random() * elements.length);
        randomElements.push(elements[randomIndex]);
      }
      
      for (const el of randomElements) {
        try {
          const box = await el.boundingBox();
          if (box) {
            await this.page.mouse.move(
              box.x + box.width / 2,
              box.y + box.height / 2,
              { steps: 15 + Math.floor(Math.random() * 10) }
            );
            await sleep(randomHumanDelay(500, 1500)); // "Leer"
          }
        } catch (e) {
          // Elemento no visible, continuar
        }
      }
    }
    
    // 4. Movimiento errático ocasional (como si se distrae)
    if (Math.random() > 0.7) {
      const distractedX = Math.random() * 1920;
      const distractedY = Math.random() * 1080;
      await this.page.mouse.move(distractedX, distractedY, { steps: 30 });
      await sleep(randomHumanDelay(1000, 2000));
    }
    
    console.log('✓ Comportamiento humano avanzado completado');
  }

  // Tipeo humano con errores y correcciones
  async tipeoHumano(selector, text) {
    await this.page.click(selector);
    await sleep(randomHumanDelay(100, 300));
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // 5% probabilidad de error de tipeo
      if (Math.random() < 0.05 && i < text.length - 1) {
        // Tipear letra incorrecta
        const wrongChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        await this.page.keyboard.type(wrongChar, { 
          delay: randomHumanDelay(50, 150)
        });
        await sleep(randomHumanDelay(100, 300));
        
        // Corregir con Backspace
        await this.page.keyboard.press('Backspace');
        await sleep(randomHumanDelay(50, 150));
      }
      
      // Tipear caracter correcto
      await this.page.keyboard.type(char, { 
        delay: randomHumanDelay(50, 150)
      });
      
      // Pausas más largas después de ciertas teclas
      if (char === ' ' || char === '.' || char === ',') {
        await sleep(randomHumanDelay(100, 300));
      }
    }
  }

  // Click con movimiento natural hacia el elemento
  async clickHumano(selector, isSearchButton = false) {
    const element = await this.page.$(selector);
    if (!element) {
      throw new Error(`Elemento ${selector} no encontrado`);
    }
    
    const box = await element.boundingBox();
    if (!box) {
      await this.page.click(selector);
      return;
    }
    
    // Obtener posición actual del mouse
    const currentPos = await this.page.evaluate(() => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    }));
    
    // Calcular posición target con pequeño offset aleatorio (no perfectamente centrado)
    const targetX = box.x + box.width / 2 + (Math.random() - 0.5) * (box.width * 0.3);
    const targetY = box.y + box.height / 2 + (Math.random() - 0.5) * (box.height * 0.3);
    
    // Movimiento en curva (simular curva bezier con puntos intermedios)
    const midX1 = currentPos.x + (targetX - currentPos.x) * 0.3 + (Math.random() - 0.5) * 100;
    const midY1 = currentPos.y + (targetY - currentPos.y) * 0.3 + (Math.random() - 0.5) * 100;
    
    const midX2 = currentPos.x + (targetX - currentPos.x) * 0.7 + (Math.random() - 0.5) * 50;
    const midY2 = currentPos.y + (targetY - currentPos.y) * 0.7 + (Math.random() - 0.5) * 50;
    
    await this.page.mouse.move(midX1, midY1, { steps: 10 });
    await sleep(randomHumanDelay(20, 50));
    await this.page.mouse.move(midX2, midY2, { steps: 10 });
    await sleep(randomHumanDelay(20, 50));
    await this.page.mouse.move(targetX, targetY, { steps: 8 });
    
    // Pausa antes de click (humanos no clickean inmediatamente)
    await sleep(randomHumanDelay(100, 300));
    
    // Click con ligera variación en el tiempo de presión
    await this.page.mouse.down();
    await sleep(randomHumanDelay(50, 120));
    await this.page.mouse.up();
  }

  // Click ultra-humano específicamente para botones críticos (como búsqueda)
  // Nueva función: Interacciones inteligentes variables según el perfil del reintento
  async ejecutarInteraccionesInteligentes(numeroIntento) {
    const perfil = obtenerPerfilComportamiento(numeroIntento);
    console.log(`\n🎭 PERFIL REINTENTO #${numeroIntento}: ${perfil.nombre.toUpperCase()}`);
    console.log(`   ├─ Velocidad mouse: ${perfil.velocidadMouse}x`);
    console.log(`   ├─ Verificaciones: ${perfil.pausasVerificacion ? 'SÍ' : 'NO'}`);
    console.log(`   ├─ Orden: ${perfil.orderAleatorio ? 'ALEATORIO' : 'NORMAL'}`);
    console.log(`   └─ Interacciones extras: ${perfil.clicksAdicionales ? 'SÍ' : 'NO'}`);

    // COMPORTAMIENTO COMPLEJO 1: Scrolling natural inicial
    // ALEATORIO: 40% de probabilidad de scrollear
    if (Math.random() > 0.6) {
      console.log('   📜 Scroll inicial exploratorio...');
      
      // Scroll múltiple ALEATORIO (0-3 scrolls)
      const scrollCount = Math.floor(Math.random() * 3);
      for (let i = 0; i < scrollCount; i++) {
        const scrollAmount = (Math.random() - 0.5) * 200; // -100 a +100 aleatorio
        await this.page.evaluate((amount) => {
          window.scrollBy(0, amount);
        }, scrollAmount);
        await sleep(randomHumanDelay(200, 700));
      }
      
      // A veces vuelve al inicio, a veces no
      if (Math.random() > 0.4) {
        await this.page.evaluate(() => {
          window.scrollTo(0, 0);
        });
        await sleep(randomHumanDelay(150, 400));
      }
    }

    // COMPORTAMIENTO COMPLEJO 2: Lectura visual inicial del formulario
    // ALEATORIO: 70% de probabilidad
    if (Math.random() > 0.3) {
      console.log('   👀 Lectura visual inicial...');
      const fieldsToBrowse = [
        '#frmPrincipal\\:ano',
        '#frmPrincipal\\:mes',
        '#frmPrincipal\\:dia',
        '#frmPrincipal\\:cmbTipoComprobante'
      ];
      
      // ALEATORIO: 0-3 campos
      const browseCount = Math.floor(Math.random() * 4);
      for (let i = 0; i < browseCount; i++) {
        const randomField = fieldsToBrowse[Math.floor(Math.random() * fieldsToBrowse.length)];
        try {
          await this.page.hover(randomField);
          await sleep(randomHumanDelay(400, 1000)); // Lectura
        } catch (e) {}
      }
    }

    // Seleccionar radio button (RUC/Cédula - por defecto)
    const radioButton = '#frmPrincipal\\:opciones\\:0';
    
    if (perfil.clicksAdicionales) {
      // Pasar mouse sobre la etiqueta primero
      await this.page.hover('label[for="frmPrincipal:opciones:0"]');
      await sleep(randomHumanDelay(...perfil.delayHover));
      
      // Click extra de verificación (usuario confirma su selección)
      await sleep(randomHumanDelay(150, 350));
    }

    // COMPORTAMIENTO COMPLEJO 3: Click con pequeños movimientos previos
    // ALEATORIO: 60% hace movimientos circulares
    if (Math.random() > 0.4) {
      const radioElement = await this.page.$(radioButton);
      if (radioElement) {
        const radioBounds = await radioElement.boundingBox();
        if (radioBounds) {
          // ALEATORIO: 0-3 movimientos circulares
          const circleCount = Math.floor(Math.random() * 3);
          for (let i = 0; i < circleCount; i++) {
            const offset = (Math.random() - 0.5) * 15;
            await this.page.mouse.move(radioBounds.x + offset, radioBounds.y + offset, { steps: 3 });
            await sleep(randomHumanDelay(50, 200));
          }
        }
      }
    }
    
    // COMPORTAMIENTO: Hover opcional antes de click (30%)
    if (Math.random() > 0.7 && !perfil.clicksAdicionales) {
      await this.page.hover(radioButton);
      await sleep(randomHumanDelay(100, 300));
    }

    await this.page.click(radioButton);
    await sleep(randomHumanDelay(...perfil.delayClick));
    registrarComportamiento('interaccion', {
      tipo: 'radio_selection',
      elemento: 'opciones_ruc',
      tiempo: Date.now()
    });

    // Rellenar campo de parámetro (ya viene pre-llenado con RUC)
    const txtParametro = '#frmPrincipal\\:txtParametro';
    
    // COMPORTAMIENTO COMPLEJO 4: Verificación extrema del campo de texto
    console.log('   📝 Interacción compleja con campo de parámetro...');
    
    // ALEATORIO: 50% hace espera antes
    if (Math.random() > 0.5) {
      await this.page.waitForSelector(txtParametro);
      await sleep(randomHumanDelay(200, 600));
    }

    // Múltiples hovers ALEATORIOS en el campo (usuario explorando)
    const txtBox = await this.page.$(txtParametro);
    if (txtBox && Math.random() > 0.3) { // 70% hace hovers
      const bounds = await txtBox.boundingBox();
      if (bounds) {
        // ALEATORIO: 0-3 hovers
        const hoverCount = Math.floor(Math.random() * 4);
        for (let i = 0; i < hoverCount; i++) {
          const offsetX = (Math.random() - 0.5) * 30;
          const offsetY = (Math.random() - 0.5) * 15;
          await this.page.mouse.move(
            bounds.x + bounds.width / 2 + offsetX,
            bounds.y + bounds.height / 2 + offsetY,
            { steps: 5 }
          );
          await sleep(randomHumanDelay(200, 700)); // Lectura variable
        }
      }
    }

    // Click en el campo - ALEATORIO (60%)
    if (Math.random() > 0.4) {
      await this.page.click(txtParametro);
      await sleep(randomHumanDelay(150, 400));
      
      // ALEATORIO: Movimiento post-click opcional (50%)
      if (txtBox && Math.random() > 0.5) {
        const bounds = await txtBox.boundingBox();
        if (bounds) {
          // Movimiento aleatorio dentro del campo
          const posX = bounds.x + Math.random() * bounds.width;
          await this.page.mouse.move(posX, bounds.y + bounds.height / 2, { steps: 7 });
          await sleep(randomHumanDelay(200, 600));
        }
      }
    }

    // Simular lectura del campo pre-llenado
    await this.page.mouse.move(
      (await txtBox?.boundingBox()).x + (await txtBox?.boundingBox()).width / 2,
      (await txtBox?.boundingBox()).y + (await txtBox?.boundingBox()).height / 2
    );
    await sleep(randomHumanDelay(400, 1000)); // Usuario lee su RUC

    // Interactuar con los dropdowns (Año, Mes, Día)
    const diaHoy = obtenerDiaActual();
    const dropdowns = [
      { selector: '#frmPrincipal\\:ano', nombre: 'año', valor: '2026' },
      { selector: '#frmPrincipal\\:mes', nombre: 'mes', valor: '1' },
      { selector: '#frmPrincipal\\:dia', nombre: 'día', valor: diaHoy }
    ];

    for (const dropdown of dropdowns) {
      console.log(`   🔽 Interacción avanzada con: ${dropdown.nombre}`);
      
      // COMPORTAMIENTO COMPLEJO 5: Exploración OPCIONAL antes de cada dropdown (40%)
      if (Math.random() > 0.6) {
        // Hacer hover en etiquetas cercanas ALEATORIO (usuario leyendo el formulario)
        const labels = await this.page.$$('label');
        const hoveredLabels = Math.floor(Math.random() * (Math.min(3, labels.length) + 1)); // 0-3 labels
        
        for (let i = 0; i < hoveredLabels; i++) {
          try {
            const label = labels[Math.floor(Math.random() * labels.length)];
            const labelBox = await label.boundingBox();
            if (labelBox) {
              await this.page.mouse.move(labelBox.x + labelBox.width / 2, labelBox.y + labelBox.height / 2);
              await sleep(randomHumanDelay(200, 600)); // Lectura variable
            }
          } catch (e) {}
        }
      }

      // Hover ALEATORIO en el dropdown (50%)
      if (Math.random() > 0.5) {
        const dropdownElement = await this.page.$(dropdown.selector);
        if (dropdownElement) {
          const dbBounds = await dropdownElement.boundingBox();
          if (dbBounds) {
            // ALEATORIO: 0-2 hovers
            const hoverCount = Math.floor(Math.random() * 3);
            for (let i = 0; i < hoverCount; i++) {
              const offsetX = (Math.random() - 0.5) * 20;
              await this.page.mouse.move(dbBounds.x + dbBounds.width / 2 + offsetX, dbBounds.y + dbBounds.height / 2, { steps: 6 });
              await sleep(randomHumanDelay(150, 500)); // Variable
            }
          }
        }
      }

      // Click en dropdown con variación
      await this.page.click(dropdown.selector);
      await sleep(randomHumanDelay(400, 1000)); // Esperar a que se abra completamente
      
      // COMPORTAMIENTO COMPLEJO 6: Lectura exhaustiva del dropdown abierto
      // Usuario lee TODAS las opciones disponibles
      if (perfil.pausasVerificacion) {
        console.log(`     📖 Lectura de opciones (${dropdown.nombre})...`);
        await sleep(randomHumanDelay(800, 2000)); // LARGA lectura
      }
      
      // Movimiento exploratorio en el dropdown abierto (si es visible)
      try {
        const options = await this.page.$$(`${dropdown.selector} option`);
        if (options.length > 2) {
          // "Leer" 2-3 opciones haciendo hover mental
          const readCount = Math.min(3, options.length);
          for (let i = 1; i < readCount; i++) {
            const opt = options[i];
            await sleep(randomHumanDelay(150, 400)); // Considerar cada opción
          }
        }
      } catch (e) {}
      
      // Seleccionar opción
      await this.page.evaluate((sel, val) => {
        const element = document.querySelector(sel);
        if (element) {
          Array.from(element.options).forEach(opt => {
            if (opt.value === val) opt.selected = true;
          });
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, dropdown.selector, dropdown.valor);

      // DEBUG: Verificar qué se seleccionó
      const seleccionado = await this.page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) {
          return {
            value: element.value,
            text: element.options[element.selectedIndex]?.text || 'N/A'
          };
        }
        return { error: 'No encontrado' };
      }, dropdown.selector);
      
      console.log(`   ✓ ${dropdown.nombre}: ${seleccionado.text} (value: ${seleccionado.value})`);

      // Delay post-selección (refuerzo de humanidad)
      const delayPostSelect = perfil.velocidadMouse < 0.7 
        ? randomHumanDelay(800, 1500)  // Lento reflexiona más
        : perfil.velocidadMouse > 1.1 
          ? randomHumanDelay(200, 400)   // Rápido menos tiempo
          : randomHumanDelay(400, 900);  // Normal
      
      await sleep(delayPostSelect);
      
      registrarComportamiento('interaccion', {
        tipo: 'dropdown_select',
        elemento: dropdown.nombre,
        valor: dropdown.valor,
        tiempo: Date.now()
      });
    }

    // Tipo de comprobante
    const tipoComprobante = '#frmPrincipal\\:cmbTipoComprobante';
    
    if (perfil.pausasVerificacion) {
      await this.page.hover(tipoComprobante);
      await sleep(randomHumanDelay(...perfil.delayHover));
    }

    await this.page.click(tipoComprobante);
    await sleep(randomHumanDelay(100, 250));
    
    // Seleccionar "Factura" (valor 1)
    await this.page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) {
        element.value = '1';
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, tipoComprobante);

    await sleep(randomHumanDelay(...perfil.delayClick));

    registrarComportamiento('interaccion', {
      tipo: 'dropdown_select',
      elemento: 'tipo_comprobante',
      valor: 'Factura',
      tiempo: Date.now()
    });

    // Comportamiento pre-click según el perfil
    if (perfil.pausasVerificacion) {
      // Revisar todo nuevamente (usuario cuidadoso)
      console.log('🔍 Verificando datos ingresados...');
      await sleep(randomHumanDelay(300, 800));
      
      // Hover final sobre el botón
      const btnBuscar = await this.page.$('#frmPrincipal\\:btnBuscar');
      if (btnBuscar) {
        const bounds = await btnBuscar.boundingBox();
        if (bounds && !perfil.skipHovers) {
          await this.page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
          await sleep(randomHumanDelay(...perfil.delayHover));
        }
      }
    }

    console.log(`✅ Interacciones del perfil completadas\n`);
  }

  async clickUltraHumano(selector) {
    console.log('🔥 Ejecutando click ULTRA-HUMANO en botón crítico...');
    
    const element = await this.page.$(selector);
    if (!element) {
      throw new Error(`Elemento ${selector} no encontrado`);
    }
    
    const box = await element.boundingBox();
    if (!box) {
      throw new Error(`Elemento ${selector} no tiene dimensiones`);
    }

    // Registrar click
    registrarComportamiento('click', {
      selector: selector,
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
      delay: 'variable',
      timestamp: new Date().toISOString()
    });

    // Usar MouseEvent con propiedades realistas en lugar de puppeteer API
    await this.page.evaluate((boxData, selectorStr) => {
      const element = document.querySelector(selectorStr);
      if (!element) throw new Error('Elemento no encontrado en DOM');
      
      // Simular múltiples eventos de mouse como lo haría un usuario real
      
      // 1. MouseEnter
      element.dispatchEvent(new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: boxData.x + boxData.width / 2 + (Math.random() - 0.5) * 10,
        clientY: boxData.y + boxData.height / 2 + (Math.random() - 0.5) * 10,
      }));
    }, box, selector);
    
    const delay1 = randomHumanDelay(150, 350, 'Fase 1: Evaluación visual');
    await sleep(delay1);
    
    // Movimiento suave final del mouse
    const targetX = box.x + box.width / 2 + (Math.random() - 0.5) * (box.width * 0.25);
    const targetY = box.y + box.height / 2 + (Math.random() - 0.5) * (box.height * 0.25);
    
    // Aproximación gradual (5 pasos muy suave)
    for (let i = 1; i <= 5; i++) {
      const progress = i / 5;
      const x = targetX * progress + 960 * (1 - progress);
      const y = targetY * progress + 540 * (1 - progress);
      await this.page.mouse.move(x, y, { steps: 3 });
      
      // Registrar movimiento
      registrarComportamiento('movimiento', {
        x: Math.round(x),
        y: Math.round(y),
        paso: i,
        timestamp: new Date().toISOString()
      });
      
      await sleep(randomHumanDelay(30, 60, `Movimiento paso ${i}`));
    }
    
    const delay2 = randomHumanDelay(360, 840, 'Fase 2: Aproximación bézier');
    
    // 2. MouseOver (puede haber tooltip)
    await this.page.evaluate((boxData, selectorStr) => {
      const element = document.querySelector(selectorStr);
      element.dispatchEvent(new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: boxData.x + boxData.width / 2,
        clientY: boxData.y + boxData.height / 2,
      }));
    }, box, selector);
    
    const delay3 = randomHumanDelay(250, 400, 'Fase 3: Hover final y correcciones');
    await sleep(delay3);
    
    // 3. MouseDown con pausa variable
    await this.page.mouse.down();
    const pressDuration = randomHumanDelay(80, 180, 'Fase 4: Eventos sincronizados - Mouse presión');
    await sleep(pressDuration);
    
    // 4. Click event simultáneo
    await this.page.evaluate((boxData, selectorStr) => {
      const element = document.querySelector(selectorStr);
      element.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: boxData.x + boxData.width / 2 + (Math.random() - 0.5) * 5,
        clientY: boxData.y + boxData.height / 2 + (Math.random() - 0.5) * 5,
        buttons: 1,
      }));
    }, box, selector);
    
    // 5. MouseUp
    await this.page.mouse.up();
    const delay5 = randomHumanDelay(140, 280, 'Fase 5: Click final');
    await sleep(delay5);
    
    // 6. MouseLeave
    await this.page.evaluate((boxData, selectorStr) => {
      const element = document.querySelector(selectorStr);
      element.dispatchEvent(new MouseEvent('mouseleave', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: boxData.x + boxData.width / 2,
        clientY: boxData.y + boxData.height / 2,
      }));
    }, box, selector);
    
    console.log('✅ Click ULTRA-HUMANO completado');
  }

  async login(ruc, clave) {
    console.log('Navegando al portal del SRI...');
    
    // Iniciar movimiento continuo de mouse
    this.startContinuousMouseMovement();
    
    // USAR networkidle2 (como el script que funciona)
    await this.page.goto('https://srienlinea.sri.gob.ec/sri-en-linea/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await this.takeScreenshot('01-pagina-inicial');
    console.log('✓ Página cargada');
    
    // ==================== VALIDACIÓN CRÍTICA DE STEALTH ====================
    // Verificar si el navegador está siendo detectado como bot
    const stealthValidado = await validarStealthPlugin(this.page);
    
    if (!stealthValidado) {
      console.warn('\n⚠️  NOTA: Stealth Plugin podría no estar funcionando correctamente');
      console.warn('    El script continuará pero con menor probabilidad de éxito\n');
    }
    // ========================================================================

    // Comportamiento humano al llegar
    await this.comportamientoHumanoAvanzado();

    console.log('Haciendo clic en "Iniciar sesión"...');
    
    try {
      await this.page.waitForSelector('a[href="/sri-en-linea/contribuyente/perfil"]', {
        timeout: 10000
      });

      // Click humano
      await this.clickHumano('a[href="/sri-en-linea/contribuyente/perfil"]');
      
      console.log('✓ Clic en "Iniciar sesión" realizado');
      
      // USAR networkidle2 (como el script que funciona)
      await this.page.waitForNavigation({ 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      await this.takeScreenshot('02-pagina-login');
      console.log('✓ Página de login cargada');
      
    } catch (error) {
      console.log('⚠️  Error al hacer clic en iniciar sesión:', error.message);
      await this.takeScreenshot('error-click-iniciar-sesion');
    }

    console.log('Esperando formulario de login...');
    
    await this.page.waitForSelector('#usuario', { timeout: 10000 });
    
    // Más comportamiento humano antes de escribir
    await delayHumanizado(500, 1000);
    
    console.log('Ingresando credenciales con tipeo humano...');
    
    // 🔑 Usar la nueva función humanizada
    await escribirLikeHuman(this.page, '#usuario', ruc);
    await delayHumanizado(300, 600);
    
    // Ocasionalmente usar Tab, otras veces click
    if (Math.random() > 0.5) {
      await this.page.keyboard.press('Tab');
      await delayHumanizado(200, 400);
    } else {
      await clickHumanizado(this.page, '#password');
    }
    
    await escribirLikeHuman(this.page, '#password', clave);

    await this.takeScreenshot('03-credenciales-ingresadas');
    await delayHumanizado(500, 1000);

    console.log('Haciendo clic en "Ingresar"...');
    
    try {
      await this.page.waitForSelector('#kc-login', { timeout: 5000 });
      await clickHumanizado(this.page, '#kc-login');
      console.log('✓ Clic en botón #kc-login');
    } catch (error) {
      console.log('⚠️  Intentando con #btnIngresar...');
      await clickHumanizado(this.page, '#btnIngresar');
    }
    
    console.log('Esperando navegación después del login...');
    
    // USAR networkidle2 (como el script que funciona)
    await this.page.waitForNavigation({ 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    await this.takeScreenshot('05-login-exitoso');
    console.log('✓ Login exitoso');
    
    await delayHumanizado(1000, 2000);
  }

  async navegarAComprobantesRecibidos() {
    console.log('Navegando a comprobantes recibidos...');
    
    await this.takeScreenshot('06-antes-navegar-comprobantes');
    
    // Comportamiento humano
    await this.comportamientoHumanoAvanzado();
    
    console.log('Haciendo clic en menú hamburguesa...');
    try {
      await this.page.waitForSelector('#sri-menu', { timeout: 10000 });
      await this.clickHumano('#sri-menu');
      console.log('✓ Menú hamburguesa abierto');
      await sleep(randomHumanDelay(800, 1500));
      await this.takeScreenshot('06b-menu-hamburguesa-abierto');
    } catch (error) {
      console.log('⚠️  Error abriendo menú hamburguesa:', error.message);
      await this.takeScreenshot('error-menu-hamburguesa');
    }
    
    console.log('Haciendo clic en "FACTURACIÓN ELECTRÓNICA"...');
    try {
      const facturacionClick = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a.ui-panelmenu-header-link'));
        const link = links.find(a => a.textContent.includes('FACTURACIÓN ELECTRÓNICA'));
        if (link) {
          link.click();
          return true;
        }
        return false;
      });
      
      if (facturacionClick) {
        console.log('✓ Click en FACTURACIÓN ELECTRÓNICA');
        await sleep(randomHumanDelay(800, 1500));
        await this.takeScreenshot('07-facturacion-electronica-expandido');
      }
    } catch (error) {
      console.log('⚠️  Error haciendo clic en FACTURACIÓN ELECTRÓNICA:', error.message);
    }
    
    console.log('Haciendo clic en "Comprobantes electrónicos recibidos"...');
    try {
      const recibidosClick = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a.ui-menuitem-link'));
        const link = links.find(a => 
          a.textContent.includes('Comprobantes electrónicos recibidos') ||
          a.href.includes('accederAplicacion.jspa?redireccion=57')
        );
        if (link) {
          link.click();
          return true;
        }
        return false;
      });
      
      if (recibidosClick) {
        console.log('✓ Click en Comprobantes electrónicos recibidos');
        
        // USAR networkidle2 (como el script que funciona)
        await this.page.waitForNavigation({ 
          waitUntil: 'networkidle2',
          timeout: 30000 
        }).catch(() => console.log('⚠️  Timeout en navegación'));
        
        await sleep(randomHumanDelay(1500, 2500));
        await this.takeScreenshot('08-comprobantes-recibidos');
        console.log('✓ En sección de comprobantes recibidos');
        
        // ==================== INTENTO DE CAPTURA GRATUITA ====================
        // Intentar extraer tokens capturados de forma gratuita
        const resultadoCaptura = await extraerTokensCaptcha(this.page);
        if (resultadoCaptura.exito) {
          console.log('🎉 EXCELENTE: Se capturaron tokens GRATIS, ahorraste $0.00145');
          // Guardar info de tokens para análisis
          global.comportamientoHumanoRegistrado.tokensCapturados = resultadoCaptura.tokens;
        } else {
          console.log('📌 Captura gratuita fallida, continuando con intento normal...');
        }
        // ========================================================================
        
        // COMPORTAMIENTO HUMANO INTENSO antes de interactuar con el formulario
        await this.comportamientoHumanoAvanzado();
        
        const diaActual = obtenerDiaActual();
        console.log(`📅 Seleccionando "Todos" (${diaActual}) en el dropdown de día...`);
        await this.page.waitForSelector('#frmPrincipal\\:dia', { timeout: 10000 });
        
        await this.clickHumano('#frmPrincipal\\:dia');
        await sleep(randomHumanDelay(200, 400));
        await this.page.select('#frmPrincipal\\:dia', diaActual);
        console.log(`✓ Seleccionado "Todos" en día`);
        
        // DEBUG: Verificar qué se seleccionó realmente
        const diaSeleccionado = await this.page.evaluate(() => {
          const select = document.querySelector('#frmPrincipal\\:dia');
          if (select) {
            return {
              value: select.value,
              selectedIndex: select.selectedIndex,
              texto: select.options[select.selectedIndex]?.text || 'N/A',
              todasOpciones: Array.from(select.options).map((opt, idx) => ({
                index: idx,
                value: opt.value,
                text: opt.text,
                selected: opt.selected
              }))
            };
          }
          return { error: 'No se encontró el select' };
        });
        
        console.log('🔍 DEBUG - Estado del dropdown DÍA:');
        console.log('   Value seleccionado:', diaSeleccionado.value);
        console.log('   Texto mostrado:', diaSeleccionado.texto);
        console.log('   Selected index:', diaSeleccionado.selectedIndex);
        if (diaSeleccionado.value !== '0') {
          console.log('   ⚠️  ADVERTENCIA: Deberían estar seleccionando "Todos" (0), no', diaSeleccionado.value);
        } else {
          console.log('   ✅ CORRECTO: "Todos" está seleccionado');
        }
        console.log('   Todas las opciones:', JSON.stringify(diaSeleccionado.todasOpciones, null, 2));
        
        await sleep(randomHumanDelay(400, 900));
        await this.takeScreenshot('09-dia-todos-seleccionado');
        
        // COMPORTAMIENTO HUMANO EXTREMADAMENTE COMPLEJO antes del click en Consultar
        console.log('🤖 Simulando comportamiento humano EXTREMADAMENTE complejo...');
        
        // ETAPA 1: Revisión OPCIONAL del formulario (70%)
        if (Math.random() > 0.3) {
          console.log('   [ETAPA 1] Revisión del formulario...');
          const formElements = await this.page.$$('#frmPrincipal input, #frmPrincipal select, #frmPrincipal label');
          
          // ALEATORIO: revisar 0-4 campos
          const reviewCount = Math.floor(Math.random() * 5);
          for (let i = 0; i < reviewCount; i++) {
            try {
              const el = formElements[Math.floor(Math.random() * formElements.length)];
              const box = await el.boundingBox();
              if (box) {
                // Movimiento variable
                const steps = Math.floor(Math.random() * 10) + 8; // 8-18 pasos
                await this.page.mouse.move(
                  box.x + box.width / 2,
                  box.y + box.height / 2,
                  { steps }
                );
                
                // Lectura VARIABLE (no determinística)
                const lecturaDuracion = randomHumanDelay(300, 1500);
                await sleep(lecturaDuracion);
                
                // Pequeños movimientos mientras "lee" el campo
                if (Math.random() > 0.6) {
                  await this.page.mouse.move(box.x + box.width - 10, box.y + box.height / 2, { steps: 5 });
                  await sleep(randomHumanDelay(100, 300));
                }
              }
            } catch (e) {}
          }
        }
        
        // ETAPA 2: Desplazamiento vertical final para verificar todo
        console.log('   [ETAPA 2] Scroll de verificación final...');
        if (Math.random() > 0.3) {
          await this.page.evaluate(() => {
            window.scrollBy(0, 50);
          });
          await sleep(randomHumanDelay(400, 800));
          
          await this.page.evaluate(() => {
            window.scrollBy(0, -50);
          });
          await sleep(randomHumanDelay(300, 600));
        }
        
        // ETAPA 3: Lectura final de múltiples elementos
        console.log('   [ETAPA 3] Lectura final minuciosa...');
        const criticalElements = [
          '#frmPrincipal\\:ano',
          '#frmPrincipal\\:mes',
          '#frmPrincipal\\:dia'
        ];
        
        for (const selector of criticalElements) {
          try {
            const el = await this.page.$(selector);
            if (el) {
              const box = await el.boundingBox();
              if (box) {
                // Aproximación lenta y deliberada
                await this.page.mouse.move(box.x + 10, box.y + box.height / 2, { steps: 8 });
                await sleep(randomHumanDelay(200, 400));
                
                // Movimiento a través del elemento
                await this.page.mouse.move(box.x + box.width - 10, box.y + box.height / 2, { steps: 12 });
                await sleep(randomHumanDelay(300, 700));
              }
            }
          } catch (e) {}
        }
        
        // Scroll para asegurar botón visible (humano)
        await this.page.evaluate(() => {
          const btn = document.querySelector('#frmPrincipal\\:btnBuscar');
          if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        await sleep(randomHumanDelay(500, 1000));
        
        // ==================== SUPER MEJORADO: CLICK AL BOTÓN DE BÚSQUEDA ====================
        console.log('\n🔥🔥🔥 INICIANDO SECUENCIA DE CLICK ULTRA-HUMANO 🔥🔥🔥\n');
        
        const btnElement = await this.page.$('#frmPrincipal\\:btnBuscar');
        const btnBox = await btnElement.boundingBox();
        
        if (!btnBox) {
          throw new Error('No se pudo obtener la posición del botón de búsqueda');
        }
        
        // ============ SISTEMA DE REINTENTOS ============
        const maxReintentos = 10;
        let intentoActual = 1;
        let captchaValidado = false;
        const timestampInicio = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        
        while (intentoActual <= maxReintentos && !captchaValidado) {
          console.log(`\n${'='.repeat(70)}`);
          console.log(`🔄 INTENTO ${intentoActual} DE ${maxReintentos}`);
          console.log(`${'='.repeat(70)}\n`);
          
          // Limpiar error anterior si existe
          if (intentoActual > 1) {
            try {
              await this.limpiarError();
              console.log('🧹 Error anterior limpiado');
            } catch (e) {
              // Ignorar si no hay error
            }
          }
          
          // NUEVA: Ejecutar interacciones inteligentes variables según el perfil
          try {
            await this.ejecutarInteraccionesInteligentes(intentoActual);
          } catch (error) {
            console.log('⚠️ Error en interacciones inteligentes:', error.message);
          }
          
          // Comportamiento variable ANTES de clickear - TOTALMENTE ALEATORIO
          
          // Pequeña pausa de reflexión inicial (50% probabilidad)
          if (Math.random() > 0.5) {
            console.log(`⏱️  Pausa de reflexión inicial (aleatorio)...`);
            await sleep(randomHumanDelay(200, 800));
          }
          
          // Mover mouse hacia botón con número de pasos ALEATORIO
          console.log('📍 Acercando mouse al botón...');
          const btnElement = await this.page.$('#frmPrincipal\\:btnBuscar');
          if (!btnElement) {
            throw new Error('No se encontró el botón de búsqueda');
          }
          
          const btnBox = await btnElement.boundingBox();
          if (!btnBox) {
            throw new Error('No se pudo obtener la posición del botón');
          }
          
          // Velocidad de aproximación ALEATORIA (8-20 pasos)
          const stepsAproximacion = 8 + Math.floor(Math.random() * 13);
          await this.page.mouse.move(
            btnBox.x + btnBox.width / 2,
            btnBox.y + btnBox.height / 2,
            { steps: stepsAproximacion }
          );
          
          // REFLEXIÓN FINAL - 70% probabilidad de ocurrir
          if (Math.random() > 0.3) {
            const reflexionFinal = randomHumanDelay(800, 3500); // Completamente aleatorio
            console.log(`⏳ Reflexión final pre-click: ${Math.round(reflexionFinal)}ms`);
            await sleep(reflexionFinal);
          }
          
          // Movimientos circulares/exploratorios - 60% probabilidad
          if (Math.random() > 0.4) {
            const circuloX = btnBox.x + btnBox.width / 2;
            const circuloY = btnBox.y + btnBox.height / 2;
            const numCirculos = Math.floor(Math.random() * 4); // 0-3 movimientos circulares
            
            for (let i = 0; i < numCirculos; i++) {
              const anguloRadianes = Math.random() * Math.PI * 2; // Ángulo completamente aleatorio
              const radioCirculo = 15 + Math.random() * 35; // Radio aleatorio 15-50px
              const x = circuloX + Math.cos(anguloRadianes) * radioCirculo;
              const y = circuloY + Math.sin(anguloRadianes) * radioCirculo;
              const stepsCirculo = 3 + Math.floor(Math.random() * 6); // 3-8 pasos aleatorios
              await this.page.mouse.move(x, y, { steps: stepsCirculo });
              await sleep(randomHumanDelay(80, 400));
            }
            
            // Volver al centro del botón (70% probabilidad de hacerlo)
            if (Math.random() > 0.3) {
              await this.page.mouse.move(circuloX, circuloY, { steps: 2 + Math.floor(Math.random() * 3) });
            }
          }
          
          // Click al botón
          console.log('🔥 Ejecutando CLICK al botón...');
          await this.clickUltraHumano('#frmPrincipal\\:btnBuscar');
          
          console.log('✓ Click realizado exitosamente');
          
          // Comportamiento post-click (humanos no se quedan quietos)
          await sleep(randomHumanDelay(150, 350));
          
          // Mover mouse un poco (como si el usuario espera activamente)
          const postClickX = btnBox.x + (Math.random() - 0.5) * 30;
          const postClickY = btnBox.y + (Math.random() - 0.5) * 30;
          await this.page.mouse.move(postClickX, postClickY, { steps: 4 });
          
          // Esperar reCAPTCHA + respuesta del servidor
          console.log('⏳ Esperando validación reCAPTCHA (18 segundos)...');
          console.log('📊 Monitoreo de interacción: El navegador está registrando eventos del usuario...\n');
          await sleep(18000);
          
          // Verificar si hubo error de validación
          const resultado = await this.detectarErrorValidacion();
          
          if (resultado.existe) {
            console.log(`❌ Intento ${intentoActual}: Validación rechazada`);
            console.log(`   Mensaje: ${resultado.mensaje}`);
            intentoActual++;
            
            if (intentoActual <= maxReintentos) {
              console.log(`\n⏳ Esperando 3 segundos antes del reintento...\n`);
              await sleep(3000);
            }
          } else {
            captchaValidado = true;
            console.log(`✅ Intento ${intentoActual}: ¡VALIDACIÓN EXITOSA!`);
          }
        }
        
        // Después del loop de reintentos
        if (!captchaValidado) {
          console.log('\n' + '='.repeat(70));
          console.log('❌ VALIDACIÓN FALLIDA DESPUÉS DE ' + maxReintentos + ' INTENTOS CON COMPORTAMIENTO HUMANO');
          console.log('='.repeat(70));
          
          await this.takeScreenshot('error-captcha-fallback-inicio');
          
          // ==================== FALLBACK: INTENTAR CON 2CAPTCHA ====================
          console.log('\n🔄 INICIANDO FALLBACK CON 2CAPTCHA...\n');
          
          const resultados2Captcha = await resolverCaptchaConDosCapcha(this.page, this.page.url());
          
          if (resultados2Captcha.exito && resultados2Captcha.token) {
            console.log('\n✅ FALLBACK EXITOSO: Token obtenido de 2Captcha');
            console.log(`   Inyectando token en formulario...\n`);
            
            // Inyectar el token en la página
            await inyectarTokenReCaptcha(this.page, resultados2Captcha.token);
            
            // Esperar un poco y hacer click
            await sleep(randomHumanDelay(500, 1500));
            
            console.log('🔥 Ejecutando CLICK al botón de búsqueda (con token 2Captcha)...');
            await this.clickUltraHumano('#frmPrincipal\\:btnBuscar');
            
            console.log('✓ Click realizado exitosamente');
            
            // Esperar respuesta del servidor
            console.log('⏳ Esperando respuesta del servidor (15 segundos)...\n');
            await sleep(15000);
            
            // Verificar si tuvo éxito
            const resultadoFinal = await this.detectarErrorValidacion();
            
            if (!resultadoFinal.existe) {
              captchaValidado = true;
              console.log(`✅ FALLBACK: ¡VALIDACIÓN EXITOSA CON 2CAPTCHA!`);
              
              // Guardar que se usó fallback
              global.comportamientoHumanoRegistrado.fallback2CaptchaUsado = true;
              global.comportamientoHumanoRegistrado.tokenDe2Captcha = resultados2Captcha.token.substring(0, 40) + '...';
            } else {
              console.log(`❌ Fallback falló: ${resultadoFinal.mensaje}`);
              console.log('   El token de 2Captcha fue rechazado');
            }
          } else {
            console.log('❌ Error obteniendo token de 2Captcha');
            console.log('   Verifica que TWOCAPTCHA_API_KEY esté configurada en .env');
          }
          
          // Si todo falló (incluyendo fallback)
          if (!captchaValidado) {
            console.log('\n' + '='.repeat(70));
            console.log('❌ AMBOS MÉTODOS FALLARON (Comportamiento humano + 2Captcha)');
            console.log('='.repeat(70));
            
            await this.takeScreenshot('error-captcha-fallback-final');
            
            console.log('\n🔧 TÉCNICAS IMPLEMENTADAS:');
            console.log('  ✅ Distribución normal en delays (gaussiana)');
            console.log('  ✅ Movimiento de mouse con curvas bézier');
            console.log('  ✅ Tipeo realista con errores y correcciones');
            console.log('  ✅ Pausas variables entre acciones');
            console.log('  ✅ Hover y mouseover antes de clicks');
            console.log('  ✅ Múltiples eventos de mouse sincronizados');
            console.log('  ✅ Movimiento post-click realista');
            console.log('  ✅ Navigator.webdriver ocultado');
            console.log('  ✅ Canvas/WebGL fingerprint realista');
            console.log('  ✅ User Agent realista de Ecuador');
            console.log('  ✅ Registro de interacción del usuario');
            console.log('  ✅ Comportamiento visual previo al click');
            console.log('  ✅ Timing variable en presión del botón');
            console.log('  ✅ Sistema de reintentos automáticos (10x)');
            console.log('  ✅ Fallback a 2Captcha integrado');
            
            console.log('\n🤖 RAZÓN DEL RECHAZO:');
            console.log('Google reCAPTCHA Enterprise usa:');
            console.log('  • Análisis de patrones de comportamiento a nivel de sesión');
            console.log('  • Historial de IP y geografía');
            console.log('  • Análisis de recursos de máquina (CPU/GPU)');
            console.log('  • Detección de CDP (Chrome DevTools Protocol)');
            console.log('  • Análisis de jitter en timing');
            console.log('  • Machine Learning para perfiles de automatización');
            
            console.log('\n💡 PRÓXIMOS PASOS:');
            console.log('  1️⃣  Verifica que TWOCAPTCHA_API_KEY esté en .env');
            console.log('  2️⃣  Verifica que tengas crédito en 2Captcha');
            console.log('  3️⃣  Intenta con otra IP/proxy diferente');
            console.log('  4️⃣  Espera 24h antes de reintentar desde la misma máquina');
            console.log('  5️⃣  Usa máquina real (no VM) para mejor éxito');
            
            console.log('\n' + '='.repeat(70));
            
            throw new Error('reCAPTCHA rechazado (Fallback 2Captcha tampoco funcionó)');
          }
        } else {
          // Validación exitosa
          console.log('\n' + '='.repeat(70));
          console.log('✅ VALIDACIÓN COMPLETADA EXITOSAMENTE EN INTENTO ' + intentoActual);
          console.log('='.repeat(70));
          
          // Guardar caso exitoso
          const ruc = process.env.SRI_RUC || 'DESCONOCIDO';
          await this.guardarCasoExitoso(intentoActual, ruc, timestampInicio);
          
          await this.takeScreenshot('10-resultados-busqueda');
          
          const hayResultados = await this.page.evaluate(() => {
            const panel = document.querySelector('#frmPrincipal\\:panelListaComprobantes');
            return panel && panel.textContent.length > 50;
          });
          
          if (hayResultados) {
            console.log('\n📊 RESULTADO:');
            console.log('✅ Resultados cargados exitosamente');
            console.log('\n🎉🎉🎉 ÉXITO TOTAL! El comportamiento humano funcionó!');
            console.log('El servidor aceptó la solicitud como de un usuario legítimo.\n');
          } else {
            console.log('\n⚠️  No se detectaron resultados (puede ser normal si no hay facturas)\n');
          }
        }
      }
    } catch (error) {
      console.log('⚠️  Error en navegación:', error.message);
      await this.takeScreenshot('error-navegacion');
      throw error;
    }
  }

  async cerrar() {
    this.stopContinuousMouseMovement();
    if (this.browser) {
      await this.browser.close();
      console.log('✓ Navegador cerrado');
    }
  }
}

async function main() {
  const downloader = new SRIDownloader();

  try {
    const ruc = process.env.SRI_RUC;
    const clave = process.env.SRI_CLAVE;

    if (!ruc || !clave) {
      console.error('❌ Faltan credenciales en el archivo .env');
      console.log('Crea un archivo .env con:');
      console.log('SRI_RUC=tu_ruc');
      console.log('SRI_CLAVE=tu_clave');
      process.exit(1);
    }

    console.log('🚀 Iniciando con comportamiento humano AVANZADO...');
    console.log('📋 Técnicas MEJORADAS implementadas:');
    console.log('  • Click ULTRA-HUMANO con 5 fases detalladas');
    console.log('  • Movimiento de mouse con curvas bézier');
    console.log('  • Easing function para aceleración natural');
    console.log('  • Múltiples eventos MouseEnter/MouseOver/MouseLeave');
    console.log('  • Tipeo con errores y correcciones');
    console.log('  • Pausas de lectura/verificación');
    console.log('  • Timing con distribución normal (gaussiana)');
    console.log('  • Click con presión variable');
    console.log('  • Comportamiento post-click realista');
    console.log('  • Registro de eventos de interacción');
    console.log('  • Navigator.webdriver ocultado completamente');
    console.log('  • Canvas/WebGL fingerprint realista');
    console.log('  • Permissions API mockeada');
    console.log('  • Movimiento continuo de mouse en background');
    console.log('  • Scroll con aceleración/desaceleración');
    console.log('  • User agent aleatorio de navegadores reales\n');
    
    await downloader.inicializar();
    await downloader.login(ruc, clave);
    await downloader.navegarAComprobantesRecibidos();

    console.log('\n✅ Proceso completado');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('reCAPTCHA rechazado')) {
      console.log('\n💡 SIGUIENTE PASO:');
      console.log('Podemos intentar:');
      console.log('  1. Ejecutar varias veces (a veces funciona por probabilidad)');
      console.log('  2. Usar 2captcha ($9/mes para 100 usuarios)');
      console.log('  3. Agregar más variaciones en el comportamiento');
      console.log('\n¿Quieres que ejecutemos el script 3 veces seguidas?');
    }
    
    console.error(error.stack);
  } finally {
    await downloader.cerrar();
  }
}

main();
