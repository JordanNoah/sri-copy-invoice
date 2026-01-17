# SRI Automatizado - Guía de Uso

## 🤖 Función Automatizada

La función automatizada del SRI se ejecuta al iniciar el servidor y:

1. ✅ Obtiene todas las credenciales guardadas
2. ✅ Hace login automático para cada empresa
3. ✅ Descarga facturas de los últimos 30 días
4. ✅ Cierra la sesión del navegador

## 📋 Instalación

```bash
npm install puppeteer
npm install --save-dev @types/puppeteer
```

## 🚀 Uso

### 1. Guardar credenciales primero

Usa la API para guardar las credenciales:

```bash
curl -X POST http://localhost:3000/api/v1/company/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Mi Empresa S.A.",
    "ruc": "1234567890001",
    "username": "usuario@sri.gob.ec",
    "password": "MiContraseña123"
  }'
```

### 2. Iniciar el servidor

```bash
npm run dev
```

El servidor automáticamente:
- Iniciará
- Esperará 2 segundos
- Ejecutará el proceso automatizado del SRI

### 3. Ver los logs

Verás algo como esto:

```
Server is running on port 3000

========================================
🤖 Iniciando proceso automatizado del SRI
========================================

📋 Obteniendo credenciales guardadas...
✅ Se encontraron 1 empresa(s)

--- Procesando: Mi Empresa S.A. (1234567890001) ---
🔐 Iniciando sesión en el SRI...
✅ Login exitoso para Mi Empresa S.A.
📥 Descargando facturas desde 01/01/2024 hasta 31/01/2024...
✅ Facturas descargadas en: ./downloads
🔒 Sesión cerrada para Mi Empresa S.A.

========================================
✅ Proceso automatizado completado
========================================
```

## ⚙️ Configuración

### Cambiar rango de fechas

En `src/infrastructure/service/sri-automated.service.ts` línea 45-48:

```typescript
// Cambiar los últimos 30 días por cualquier rango
const today = new Date();
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 30); // ← Cambiar aquí
```

### Desactivar en producción

En `src/presentation/server.ts` línea 29, comentar la línea:

```typescript
// await this.runSRIAutomation() // ← Comentar esta línea
```

### Cambiar delay de inicio

En `src/presentation/server.ts` línea 64:

```typescript
setTimeout(async () => {
  await sriAutomatedLogin()
}, 2000) // ← Cambiar milisegundos (2000 = 2 segundos)
```

## 🔧 Ajustes Necesarios

Antes de usar, debes ajustar los selectores CSS del SRI en `src/infrastructure/service/sri.service.ts`:

### Selectores de Login (líneas 47-56)
```typescript
// Ajusta según el HTML real del SRI
await this.page.type('input[name="usuario"]', username);
await this.page.type('input[name="password"]', password);
await this.page.click('button[type="submit"]');
```

### Selectores de Descarga (líneas 96-110)
```typescript
await this.page.type('input[name="fechaInicio"]', fechaInicio);
await this.page.type('input[name="fechaFin"]', fechaFin);
await this.page.click('button[type="submit"]');
```

## 🐛 Debugging

### Ver navegador en acción

En `src/infrastructure/service/sri.service.ts` línea 20:

```typescript
this.browser = await puppeteer.launch({
  headless: false, // ← false = ver navegador
  args: [...]
});
```

### Tomar screenshots

La función tiene soporte para screenshots (útil para debugging):

```typescript
await sriService.screenshot('./debug-login.png');
```

## 📝 Flujo del Proceso

```
Servidor Inicia
  ↓
Espera 2 segundos
  ↓
Obtiene todas las credenciales de la DB
  ↓
Para cada empresa:
  ├─ Obtiene credenciales desencriptadas
  ├─ Abre navegador (Puppeteer)
  ├─ Navega al SRI
  ├─ Ingresa usuario y contraseña
  ├─ Hace login
  ├─ Descarga facturas (últimos 30 días)
  ├─ Cierra navegador
  └─ Continúa con siguiente empresa
  ↓
Proceso completado
```

## ⚠️ Notas Importantes

1. **Selectores CSS**: Los selectores son aproximados. Debes inspeccionar el HTML real del SRI.

2. **CAPTCHA**: Si el SRI tiene CAPTCHA, necesitarás una solución adicional.

3. **Una empresa a la vez**: El navegador se cierra después de cada empresa para evitar conflictos.

4. **Timeouts**: Configurados en 60 segundos. Ajusta según la velocidad del SRI.

5. **Path de descargas**: Por defecto `./downloads`. Asegúrate de que el directorio exista.

6. **Solo debugging**: Esta función es para debugging. En producción usa un cron job.

## 🔄 Próximos Pasos

1. Guardar credenciales vía API
2. Iniciar servidor con `npm run dev`
3. Verificar que el login funcione
4. Ajustar selectores si es necesario
5. Implementar cron job para producción
