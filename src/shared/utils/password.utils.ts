import crypto from "crypto";

/**
 * Utilidades para encriptación/desencriptación de contraseñas
 * Usa AES-256-GCM para encriptación simétrica segura
 */
export class PasswordUtils {
  // Clave de encriptación (debe estar en variables de entorno en producción)
  private static ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-32-character-secret-key!!"; // 32 bytes
  private static IV_LENGTH = 16; // Para AES, esto siempre es 16

  /**
   * Encriptar una contraseña
   * @param plainPassword Contraseña en texto plano
   * @returns Contraseña encriptada en formato: iv:encryptedData:authTag
   */
  static encrypt(plainPassword: string): string {
    // Asegurar que la clave tenga exactamente 32 bytes
    const key = crypto.scryptSync(this.ENCRYPTION_KEY, "salt", 32);
    
    // Generar IV aleatorio
    const iv = crypto.randomBytes(this.IV_LENGTH);
    
    // Crear cipher
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    
    // Encriptar
    let encrypted = cipher.update(plainPassword, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    // Obtener auth tag
    const authTag = cipher.getAuthTag();
    
    // Retornar: iv:encrypted:authTag (todo en hex)
    return `${iv.toString("hex")}:${encrypted}:${authTag.toString("hex")}`;
  }

  /**
   * Desencriptar una contraseña
   * @param encryptedPassword Contraseña encriptada
   * @returns Contraseña en texto plano
   */
  static decrypt(encryptedPassword: string): string {
    try {
      // Asegurar que la clave tenga exactamente 32 bytes
      const key = crypto.scryptSync(this.ENCRYPTION_KEY, "salt", 32);
      
      // Separar componentes
      const parts = encryptedPassword.split(":");
      if (parts.length !== 3) {
        throw new Error("Formato de contraseña encriptada inválido");
      }
      
      const iv = Buffer.from(parts[0], "hex");
      const encrypted = parts[1];
      const authTag = Buffer.from(parts[2], "hex");
      
      // Crear decipher
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(authTag);
      
      // Desencriptar
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      
      return decrypted;
    } catch (error) {
      throw new Error("Error al desencriptar contraseña");
    }
  }
}
