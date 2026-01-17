# 🤖 Mejoras de Comportamiento Humano - Sistema de Reintentos de Captcha

## Cambios Realizados

### 1. **Aumentado número de intentos**
   - ❌ Antes: 10 intentos máximos
   - ✅ Ahora: 20 intentos máximos (configurable)
   - Permite mayor tolerancia a errores de captcha

### 2. **Comportamiento Humano Mejorado - Antes de Hacer Clic**

#### 🔄 Scrolling Simulado
```typescript
simulateHumanScrolling()
- Scroll hacia abajo (100-200px)
- Pausa 200-400ms
- Scroll hacia arriba (50-100px)
- Pausa 200-400ms
- Scroll hacia abajo nuevamente (100-150px)
```
Simula que un humano está leyendo el formulario antes de actuar.

#### 🖱️ Movimiento Suave del Mouse
```typescript
moveMouseToButton()
- Genera posición inicial aleatoria
- Mueve hacia el botón en 15 pasos suave
- Pausa cada 5 pasos (temblores humanos)
- Permanece en hover 200-500ms
```
Evita movimientos rectos/automáticos que detectan bots.

#### ⏳ Delays Inteligentes
- Basados en el número de intento
- Aumentan conforme avanzan intentos (simula frustración)
- Fórmula: `baseWait = 3000 + attemptNumber * 500`
- Ejemplo:
  - Intento 1: 3000-5000ms
  - Intento 5: 5500-7500ms
  - Intento 10: 8000-10000ms

### 3. **Comportamiento Entre Reintentos**

#### 🔄 Refrescar Captcha
```typescript
- Busca botón "Recargar captcha"
- Lo hace clic automáticamente
- Espera 1.5-2.5s para recarga
```

#### 🤔 Revisar Formulario (cada 3 intentos)
```typescript
- Ejecuta scrolling humano nuevamente
- Pausa 2-3 segundos (revisión)
```

#### 📜 Scroll Completo (cada 5 intentos)
```typescript
- Vuelve al inicio del formulario
- Simula que el usuario "reconsideró" algo
- Espera 1-2 segundos
```

#### 🖱️ Movimientos Aleatorios (cada intento)
```typescript
simulateRandomMouseMovement()
- 2-4 movimientos aleatorios en pantalla
- Pausa 100-300ms entre movimientos
- Crea patrón más natural
```

### 4. **Progreso Visual Mejorado**
```
🔄 Intento 1 de 20...
⏳ Esperando 3500ms para procesamiento...
⚠️ Captcha incorrecta en intento 1. Reintentando... [5%]
🤔 Revisando formulario nuevamente...
📜 Scroll completo del formulario...
✅ Búsqueda exitosa, sin errores de captcha
```

## Comparación de Comportamiento

### ❌ ANTES (Demasiado Automático)
```
1. Click inmediato
2. Espera 3000-5000ms
3. Detecta captcha incorrecto
4. Click simple en botón
5. Espera fija 1000-2000ms
6. Reintentos 1-10 (mismo patrón)
```
**Problema**: Patrón repetitivo → fácil de detectar como bot

### ✅ AHORA (Comportamiento Realista)
```
1. Scrolling suave en la página
2. Espera para leer (500-1200ms)
3. Movimiento suave del mouse hacia botón
4. Espera antes de click (300-700ms)
5. Click
6. Espera inteligente (aumenta por intento)
7. Si falla:
   - Cierra mensaje de error
   - Refresca captcha
   - Revisión aleatoria del formulario
   - Movimientos aleatorios del mouse
   - Espera variable antes del siguiente
8. Reintentos 1-20 con patrones variados
```

## Flujo de Control Mejorado

```
┌─ Inicio Intento
│
├─ 📱 Simular Scrolling Humano
├─ ⏱️ Esperar 500-1200ms
├─ 🖱️ Mover Mouse Lentamente hacia Botón
├─ ⏱️ Esperar 300-700ms
├─ 🔘 Hacer Clic
├─ ⏱️ Esperar (3000 + intento*500 a 5000 + intento*500ms)
│
├─ ❓ ¿Captcha Incorrecto?
│  │
│  ├─ NO → ✅ Éxito
│  │
│  └─ SÍ
│     ├─ 📋 Cerrar Mensaje de Error
│     ├─ 🔄 Refrescar Captcha
│     ├─ ⏱️ Esperar 1.5-2.5s
│     ├─ 🤔 Si (intento % 3 == 0): Revisar Formulario
│     ├─ 📜 Si (intento % 5 == 0): Scroll al Inicio
│     ├─ 🖱️ Movimientos Aleatorios del Mouse
│     ├─ ⏱️ Esperar (1000 + intento*200ms)
│     └─ 🔄 Reintentar
│
└─ ✅/❌ Resultado
```

## Configuración

Para ajustar el número máximo de reintentos:

```typescript
// En downloadInvoices()
await this.clickWithCaptchaRetry('#frmPrincipal\\:btnBuscar', 25); // 25 intentos
```

## Beneficios

1. ✅ **Mayor tolerancia a fallos**: 20 intentos en lugar de 10
2. ✅ **Menos detectable como bot**: Comportamiento variado y realista
3. ✅ **Mejor progreso visual**: Porcentaje y emojis informativos
4. ✅ **Pauses contextuales**: Diferentes según situación
5. ✅ **Simula frustración humana**: Aumenta delays en intentos posteriores
6. ✅ **Refresco automático de captcha**: No queda "pegado" en el mismo

## Próximas Mejoras (Opcionales)

- [ ] Agregar verificación de viewport móvil vs desktop
- [ ] Simular "lectura" de texto (scroll por párrafos)
- [ ] Agregar "typo" aleatorio al llenar formularios
- [ ] Cambiar user-agent de manera realista
- [ ] Simular pestañas abiertas en navegador
