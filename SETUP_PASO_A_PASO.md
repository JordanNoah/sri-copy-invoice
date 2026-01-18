# 🚀 INSTRUCCIONES PASO A PASO

## FASE 1: VERIFICACIÓN (5 minutos)

### Paso 1.1: Verificar que todo está instalado
```bash
cd c:\Users\sansh\projects\sri-copy-invoice
npm -v          # Debe mostrar versión
node -v         # Debe mostrar versión
```

### Paso 1.2: Verificar instalación de dependencias
```bash
npm list puppeteer
npm list puppeteer-extra
npm list puppeteer-extra-plugin-stealth

# Todas deben estar instaladas
```

### Paso 1.3: Ejecutar verificación de stealth
```bash
node verify-stealth.js

# ESPERAR A VER ESTO:
# ✅ navigator.webdriver NOT DETECTED
# ✅ Chrome object: Present
# ✅ Stealth Score: 80+/100
```

**Si falla:**
```bash
# Instalar dependencias
npm install puppeteer-extra-plugin-stealth --save
```

---

## FASE 2: PRIMERA EJECUCIÓN (15-30 minutos)

### Paso 2.1: Crear archivo .env con credenciales
```bash
cat > .env << 'EOF'
RUC=1234567890
PASSWORD=tuContraseña
EMAIL=tuEmail@example.com
EOF
```

### Paso 2.2: Ejecutar el script
```bash
npm start

# Verá:
# - Chrome se abrirá
# - Navegará a SRI
# - Ingresará credenciales humanizadas
# - Descargará invoices
```

### Paso 2.3: Monitorear primera ejecución
```
Lo que deberías ver:

[LOG] Navegando al portal del SRI...
✓ Página cargada
[SCREENSHOT] 01-pagina-inicial

[LOG] Haciendo clic en "Iniciar sesión"...
✓ Clic en "Iniciar sesión" realizado

[LOG] Ingresando credenciales con tipeo humano...
[SCREENSHOT] 03-credenciales-ingresadas

[LOG] Login exitoso
✓ Login exitoso
[SCREENSHOT] 05-login-exitoso

[LOG] Navegando a comprobantes recibidos...
# ... etc
```

### Paso 2.4: Revisar que se creó chrome-profile/
```bash
ls -la chrome-profile/

# Debe mostrar:
# total 120
# drwxr-xr-x   25 user  group  800 Dec 20 10:30 .
# drwxr-xr-x    5 user  group  160 Dec 20 10:25 ..
# drwxr-xr-x    2 user  group   64 Dec 20 10:30 Cache
# drwxr-xr-x    2 user  group   64 Dec 20 10:30 Default
# -rw-r--r--    1 user  group 1024 Dec 20 10:30 History
# etc...

# ✅ Si ves archivos = perfil creado exitosamente
# ❌ Si está vacío = puede que chrome-profile no se esté usando
```

---

## FASE 3: VERIFICAR ÉXITO (5 minutos)

### Paso 3.1: Revisar si descargó archivos
```bash
ls -la descargas/

# Debe mostrar archivos PDF con nombres como:
# 2024-12-20_factura_001.pdf
# 2024-12-20_factura_002.pdf
```

### Paso 3.2: Revisar screenshots para debugging
```bash
ls -la screenshots/

# Debe mostrar:
# 01-pagina-inicial.png
# 02-pagina-login.png
# 03-credenciales-ingresadas.png
# 04-recaptcha-check.png (si la hubo)
# 05-login-exitoso.png
# 06-comprobantes-descargados.png
```

### Paso 3.3: Revisar logs de consola
```
Buscar líneas clave:

✓ Página cargada
✓ Clic en "Iniciar sesión" realizado
✓ Login exitoso
✓ Navegación exitosa
✓ Descarga completada

Si ves todo esto = ✅ ÉXITO
```

---

## FASE 4: OPTIMIZACIÓN (OPCIONAL)

### Paso 4.1: Mejorar score con ejecuciones regulares

```bash
# Día 1: Ejecutar
npm start
# Score esperado: 0.6-0.7 ✅

# Día 2: Ejecutar de nuevo
npm start
# Score esperado: 0.75-0.8 ✅

# Día 3+: Ejecutar regularmente
npm start
# Score esperado: 0.85-0.9+ ✅✅
```

### Paso 4.2: Crear tarea automática (Windows Task Scheduler)
```bash
# Crear script batch
cat > descargar-invoices.bat << 'EOF'
@echo off
cd c:\Users\sansh\projects\sri-copy-invoice
npm start
EOF

# Luego en Windows:
# 1. Abrir Task Scheduler
# 2. Create Basic Task
# 3. Name: "SRI Descargas Automáticas"
# 4. Schedule: Diario, 8 AM
# 5. Action: Start program → descargar-invoices.bat
```

### Paso 4.3: Crear tarea automática (Linux/Mac - Cron)
```bash
# Abrir crontab
crontab -e

# Agregar línea para ejecutar diariamente a las 8 AM:
0 8 * * * cd /home/user/sri-copy-invoice && npm start

# O cada 6 horas:
0 */6 * * * cd /home/user/sri-copy-invoice && npm start
```

---

## FASE 5: SOLUCIÓN DE PROBLEMAS

### Problema 1: "reCAPTCHA detectado" 🚫

**Síntoma:**
```
[ERROR] reCAPTCHA Challenge detectado en la página
```

**Solución:**
```bash
# 1. Verificar stealth
node verify-stealth.js
# Debe mostrar Stealth Score: 80+/100

# 2. Verificar chrome-profile/
ls chrome-profile/
# Debe tener contenido (no vacío)

# 3. Verificar IP
curl https://api.ipify.org
# Si es datacenter → cambiar a ISP residencial

# 4. Resetear perfil y reintentar
rm -rf chrome-profile/
npm start
```

### Problema 2: "Chrome no se abre"

**Síntoma:**
```
Error: Failed to launch Chrome
```

**Solución:**
```bash
# 1. Verificar que Chrome está instalado
where chrome
# o
where "google chrome"

# 2. Especificar ruta en script
# En script-humano-avanzado.js línea 650:
executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',

# 3. Reinstalar chromium
npm install --save puppeteer --no-save
```

### Problema 3: "Timeout esperando elemento"

**Síntoma:**
```
[ERROR] Timeout esperando selector #usuario
```

**Solución:**
```bash
# 1. Revisar screenshot
cat screenshots/02-pagina-login.png

# 2. El selector cambió → actualizar
# Buscar en DevTools el nuevo selector

# 3. Aumentar timeout en script
await this.page.waitForSelector('#usuario', { timeout: 20000 });
# cambio de 10000 a 20000ms
```

### Problema 4: "Credenciales inválidas"

**Síntoma:**
```
[ERROR] Credenciales inválidas o expiradas
```

**Solución:**
```bash
# 1. Verificar .env
cat .env
# Debe tener RUC y PASSWORD correctos

# 2. Verificar credenciales en SRI manualmente
# Ir a https://srienlinea.sri.gob.ec
# Intentar login manual
# Si falla manual → credenciales malas

# 3. Revisar que tipo de cuenta es
# Algunas cuentas requieren autenticación adicional
```

### Problema 5: "PDFs no se descargan"

**Síntoma:**
```
[LOG] Descargando comprobantes...
[ERROR] No se pudieron descargar archivos
```

**Solución:**
```bash
# 1. Revisar descargas/
ls descargas/
# Debe estar vacío antes de ejecutar

# 2. Revisar permisos de carpeta
chmod -R 755 descargas/

# 3. Revisar que los comprobantes existan en SRI
# Ir manualmente a https://srienlinea.sri.gob.ec
# Verificar que hay comprobantes recibidos

# 4. Aumentar timeout de descarga
// En script-humano-avanzado.js
await this.page.waitForNavigation({ timeout: 60000 });  // 60 segundos
```

---

## FASE 6: MANTENIMIENTO

### Semanal
```bash
# Ejecutar script
npm start

# Verificar que descargó invoices
ls -la descargas/ | tail -10
```

### Mensual
```bash
# Ejecutar verificación de stealth
node verify-stealth.js

# Revisar que Stealth Score sigue siendo 80+/100
```

### Trimestral
```bash
# Revisar que chrome-profile/ tiene contenido
du -sh chrome-profile/
# Debe mostrar valor > 10MB

# Si está vacío, puede indicar problema
```

### Anual
```bash
# Revisar si SRI cambió estructura HTML
# (Los selectores pueden cambiar)

# Ejecutar con nuevas credenciales si es necesario
npm start -- --test-mode
```

---

## FASE 7: ESCALABILIDAD (MÚLTIPLES RUCS)

Si necesitas automatizar múltiples RUCs:

### Opción 1: Múltiples .env
```bash
# .env.ruc1
RUC=1234567890
PASSWORD=pass1

# .env.ruc2  
RUC=0987654321
PASSWORD=pass2

# Script para ejecutar todos
for env in .env.*; do
  cp "$env" .env
  npm start
done
```

### Opción 2: Variables de ambiente
```bash
# Script mejorado que recibe RUC como parámetro
npm start -- --ruc=1234567890 --password=contraseña
```

### Opción 3: Servicio Node en servidor
```bash
# Crear API REST que ejecuta descargas
# POST /download
# {
#   "ruc": "1234567890",
#   "password": "contraseña"
# }

# Recomendación: PM2 para gestionar procesos
npm install -g pm2
pm2 start npm --name "sri-downloads" -- start
pm2 save
pm2 startup
```

---

## 📋 CHECKLIST FINAL

- [ ] `node verify-stealth.js` muestra ✅ en todo
- [ ] `npm start` se ejecuta sin errores
- [ ] Chrome se abre y navega a SRI
- [ ] Credenciales se ingresa humanizadas
- [ ] PDFs se descargan en descargas/
- [ ] chrome-profile/ se crea y persiste
- [ ] Segunda ejecución funciona mejor que la primera

**Si todo ✅ → LISTO PARA PRODUCCIÓN**

---

## 🎯 PRÓXIMOS PASOS

1. Completar FASE 1-3 (verificación y primera ejecución)
2. Revisar descargas en `descargas/`
3. Configurar ejecución automática (Task Scheduler o Cron)
4. Ejecutar semanalmente para mantener perfil fuerte
5. Contactar a SRI si necesitas integración oficial

---

**¿Necesitas ayuda?** Revisa:
- FAQ.md - Preguntas frecuentes
- GUIA_RAPIDA.md - Resumen
- RECAPTCHA_V3_THEORY.js - Teoría técnica
