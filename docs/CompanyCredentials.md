# CompanyCredentials - Modelo Simplificado con UPSERT

Sistema simple para guardar credenciales de empresas para acceder al SRI.

## 📋 Características

- ✅ **Almacenamiento seguro** con encriptación AES-256-GCM
- ✅ **Validación de RUC** (13 dígitos)
- ✅ **UUIDs únicos** para cada empresa
- ✅ **Desencriptación** para usar las credenciales
- ✅ **UPSERT** basado en RUC (crea o actualiza automáticamente)

## 🗄️ Estructura de la Base de Datos

### Tabla: `company_credentials`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INTEGER | ID autoincrementable (PK) |
| `companyUuid` | UUID | UUID único de la empresa |
| `companyName` | VARCHAR(255) | Nombre o razón social |
| `ruc` | VARCHAR(13) | RUC de la empresa (único, índice para upsert) |
| `username` | VARCHAR(255) | Usuario para el SRI |
| `password` | VARCHAR(255) | Contraseña encriptada |
| `createdAt` | DATETIME | Fecha de creación |
| `updatedAt` | DATETIME | Fecha de actualización |

## 🚀 Uso

### 1. Guardar Credenciales (UPSERT)

El método `saveCompanyCredentials` usa **UPSERT**:
- Si el RUC **no existe** → Crea un nuevo registro
- Si el RUC **ya existe** → Actualiza el registro existente

```typescript
import { saveCompanyCredentials } from "@/examples/company-credentials-usage";

// Primera vez - CREA
const cred = await saveCompanyCredentials(
  "Mi Empresa S.A.",
  "1234567890001",
  "usuario@sri.gob.ec",
  "MiContraseñaSRI123"
);

// Segunda vez con mismo RUC - ACTUALIZA
const credActualizada = await saveCompanyCredentials(
  "Mi Empresa S.A. (Actualizada)",
  "1234567890001",  // ← Mismo RUC = actualiza
  "nuevo@sri.gob.ec",
  "NuevaContraseña456"
);
```

### 2. Obtener Credenciales Desencriptadas para Usar

```typescript
import { getDecryptedCredentials } from "@/examples/company-credentials-usage";

const credentials = await getDecryptedCredentials("1234567890001");

// Ahora puedes usar las credenciales
console.log("Usuario:", credentials.username);
console.log("Password:", credentials.password); // Texto plano para usar en el login
```

### 3. Listar Todas

```typescript
import { listAllCredentials } from "@/examples/company-credentials-usage";

const all = await listAllCredentials();
all.forEach(cred => {
  console.log(cred.toPublicData());
});
```

### 4. Actualizar Solo Contraseña

```typescript
import { updatePassword } from "@/examples/company-credentials-usage";

await updatePassword("1234567890001", "NuevaContraseña456");
```

### 5. Eliminar

```typescript
import { deleteCredentials } from "@/examples/company-credentials-usage";

await deleteCredentials("1234567890001");
```

## 🔄 UPSERT vs CREATE/UPDATE

### Antes (Complicado) ❌
```typescript
// Tenías que verificar si existe primero
const existing = await findCredentialsByRuc("1234567890001");

if (existing) {
  await updateCredentials(...);  // Si existe
} else {
  await createCredentials(...);  // Si no existe
}
```

### Ahora (Simple) ✅
```typescript
// UPSERT lo hace automáticamente
await saveCompanyCredentials(
  "Mi Empresa",
  "1234567890001",
  "usuario@sri.gob.ec",
  "MiContraseña123"
);
// ↑ Crea o actualiza según el RUC
```

## 🛡️ Seguridad

Las contraseñas se encriptan usando **AES-256-GCM** que es:
- ✅ Reversible (puedes desencriptar para usar)
- ✅ Seguro para almacenamiento
- ✅ Incluye autenticación (evita manipulación)

### ⚠️ IMPORTANTE: Variable de Entorno

Debes configurar una clave de encriptación en `.env`:

```env
ENCRYPTION_KEY=tu-clave-secreta-de-32-caracteres-minimo
```

Esta clave se usa para encriptar/desencriptar las contraseñas. **NO LA COMPARTAS** y guárdala de forma segura.

## 🏗️ Arquitectura

```
src/
├── domain/
│   ├── entity/
│   │   └── CompanyCredentials.ts      # Entidad
│   ├── dto/
│   │   └── CompanyCredentials.ts      # DTO único
│   └── datasource/
│       └── CompanyCredentials.ts      # Datasource abstracto (con upsert)
├── infrastructure/
│   ├── database/
│   │   └── models/
│   │       └── CompanyCredentials.ts  # Modelo Sequelize
│   └── datasource/
│       └── CompanyCredentialsSequelizeDatasource.ts  # Implementación
├── shared/
│   └── utils/
│       └── password.utils.ts          # Encriptación
└── examples/
    └── company-credentials-usage.ts   # Funciones de uso
```

## 📚 Funciones Disponibles

| Función | Descripción |
|---------|-------------|
| `saveCompanyCredentials()` | ⭐ UPSERT - Guardar (crear o actualizar) |
| `findCredentialsByRuc()` | Buscar por RUC |
| `findCredentialsByUuid()` | Buscar por UUID |
| `listAllCredentials()` | Listar todas |
| `getDecryptedCredentials()` | Obtener credenciales desencriptadas |
| `updatePassword()` | Actualizar solo contraseña |
| `deleteCredentials()` | Eliminar |
| `countCredentials()` | Contar total |

## 💡 Flujo de Trabajo Típico

```typescript
// 1. Guardar credenciales (primera vez o actualización)
await saveCompanyCredentials(
  "Empresa XYZ",
  "1234567890001",
  "user@sri.gob.ec",
  "password123"
);

// 2. Obtener credenciales para usar en login del SRI
const creds = await getDecryptedCredentials("1234567890001");

// 3. Usar en tu lógica de descarga
await loginToSRI(creds.username, creds.password);
await downloadFiles();
```
