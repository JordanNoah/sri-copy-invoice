# 🎯 Técnicas Avanzadas de Bypass de Captcha - Implementación Oxylabs

## Basado en: https://github.com/oxylabs/bypass-captcha-puppeteer

### Técnicas Implementadas

#### 1. **User-Agent Realista**
```typescript
await this.page.setUserAgent(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
);
```
**Beneficio**: Los sitios no pueden identificar como bot por User-Agent genérico.

#### 2. **Headers HTTP Mejorados**
```typescript
await this.page.setExtraHTTPHeaders({
  'Accept-Language': 'es-EC,es;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
});
```
**Beneficio**: Imita navegador real con preferencias de idioma (Ecuador).

#### 3. **networkidle0 - Total Network Idle**
```typescript
await this.page.waitForNavigation({ waitUntil: 'networkidle0' })
```
**Niveles de espera**:
- `load`: Espera evento `load` del DOM
- `networkidle2`: Max 2 conexiones de red (default)
- `networkidle0`: 0 conexiones de red (MÁXIMO - Lo usamos)

**Beneficio**: Garantiza que TODAS las solicitudes se completen, incluidos assets CSS/JS/imágenes.

#### 4. **document.readyState === 'complete'**
```typescript
await this.page.waitForFunction(() => {
  return document.readyState === 'complete';
}, { timeout: 10000 })
```
**Estados**:
- `loading`: Documento cargándose
- `interactive`: DOM interactivo
- `complete`: TODO listo (nuestro destino)

**Beneficio**: Doble validación de que la página está 100% lista.

#### 5. **Detección y Validación de Captcha**
```typescript
validateCaptchaLoaded(): Detecta si hay captcha en página
waitForCaptchaVisible(): Espera a que captcha esté renderizado
```

**Busca**:
- `iframe[src*="recaptcha"]` - reCAPTCHA v2/v3
- `[data-captcha]` - Custom captchas
- `.captcha`, `#captcha` - Clases/IDs comunes
- `.g-recaptcha` - Google reCAPTCHA específico

#### 6. **Optimización de Descarga de Archivos**
```typescript
// networkidle0: Espera a que red esté totalmente ociosa
await this.page.goto(url, { waitUntil: 'networkidle0' })

// Interceptación de respuestas para mayor control
const responseHandler = (response) => { ... }
```

**Beneficio**: Descarga más confiable sin falsos positivos.

#### 7. **Flujo Mejorado de Reintentos**

**Antes (Básico)**:
```
1. Scroll random
2. Click
3. Esperar 3-5s
4. Revisar error
5. Si falla → esperar 1-2s → Reintentar
```

**Ahora (Avanzado)**:
```
1. Validar captcha visible
2. Scroll realista
3. Esperar para "leer"
4. Mover mouse suave hacia botón
5. Esperar "decisión"
6. Click
7. waitForFunction document.readyState === 'complete'
8. networkidle0 verification
9. Si falla:
   - Cerrar mensaje error
   - Refrescar captcha
   - Validar nuevo captcha visible
   - Cada 3 intentos: revisar formulario
   - Cada 5 intentos: scroll al inicio
   - Movimientos aleatorios mouse
   - Wait escalado (1000 + intento*200ms)
   - Reintentar
```

### Tabla Comparativa

| Aspecto | Antes | Ahora |
|--------|-------|-------|
| User-Agent | Genérico Puppeteer | Chrome 120 realista |
| Headers | Mínimos | Accept-Language, Accept |
| Network Wait | networkidle2 | networkidle0 |
| DOM Validation | Ninguna | document.readyState |
| Captcha Detection | Manual | Automática con validateCaptcha |
| Descarga de Archivos | Simple goto | networkidle0 + interceptación |
| Delays | Fijos | Escalados por intento |
| Reintentos | 10 | 20 |

### Combinación con Stealth Plugin

```typescript
// Ya implementado:
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

// Stealth plugin desactiva:
✅ navigator.webdriver (que indica automation)
✅ chrome.runtime (extensiones detectables)
✅ plugins array (muestra plugins reales)
✅ permissions.query() (patrones de Chromium)
```

### Lógica de Reintentos Escalada

```
Intento 1: Wait = 3000-5000ms
Intento 5: Wait = 5500-7500ms
Intento 10: Wait = 8000-10000ms
Intento 20: Wait = 13000-15000ms

Patrón: baseWait = 3000 + (attemptNumber * 500)
```

### Próximas Mejoras (Futuro)

- [ ] Usar proxy rotativo (Oxylabs Web Unblocker - pago)
- [ ] Solver automático de imágenes (OCR)
- [ ] Captura de tokens de API si está disponible
- [ ] Machine learning para patrones de captcha
- [ ] Cookie y session persistence
- [ ] Storage de perfil de navegador

### Debugging

Cuando falle, verificar:

1. **¿User-Agent correcto?**
   ```bash
   console.log(navigator.userAgent)
   ```

2. **¿Captcha visible?**
   ```javascript
   document.querySelector('iframe[src*="recaptcha"]')
   ```

3. **¿Red lista?**
   ```javascript
   document.readyState === 'complete'
   ```

4. **¿Headers correctos?**
   ```
   DevTools → Network → Headers
   ```

5. **¿Stealth activo?**
   ```javascript
   console.log(navigator.webdriver) // Debe ser undefined
   ```

## Estadísticas Esperadas

- **Tasa de éxito**: 70-90% (sin proxy)
- **Intentos promedio**: 3-7
- **Tiempo promedio por intento**: 4-6 segundos
- **Tiempo total**: 12-42 segundos por búsqueda

Con proxy (Oxylabs): 95%+
