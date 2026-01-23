import { SRIService } from './sri.service'
import { CompanyCredentialsSequelizeDatasource } from '@/infrastructure/datasource/CompanyCredentialDatasource.impl'

/**
 * Servicio para automatizar la descarga de facturas del SRI
 * para todas las empresas registradas
 */
export class SRIAutomationService {
  private readonly credentialsDatasource: CompanyCredentialsSequelizeDatasource
  private readonly descargasDir: string

  constructor(descargasDir: string = 'C:/Users/sansh/projects/sri-copy-invoice/descargas') {
    this.credentialsDatasource = new CompanyCredentialsSequelizeDatasource()
    this.descargasDir = descargasDir
  }

  /**
   * Procesar todas las empresas registradas en la base de datos
   * Descarga facturas del SRI para cada una
   */
  public async processAllCompanies(): Promise<void> {
    try {
      console.log('Iniciando automatización del SRI...')

      // Obtener credenciales de la base de datos
      const allCredentials = await this.credentialsDatasource.getAll()

      if (allCredentials.length === 0) {
        console.log('No hay credenciales en la base de datos para automatizar')
        return
      }

      console.log(`Encontradas ${allCredentials.length} empresa(s) para procesar`)

      // Procesar cada empresa
      for (const cred of allCredentials) {
        await this.processCompany(cred.ruc, cred.companyName)
        
        // Esperar 1 minuto entre empresas para evitar sobrecarga
        if (allCredentials.indexOf(cred) < allCredentials.length - 1) {
          console.log('Esperando 60 segundos antes de procesar la siguiente empresa...')
          await this.sleep(60000)
        }
      }

      console.log('\nAutomatización completada exitosamente')
    } catch (error) {
      console.error('Error en automatización del SRI:', error)
      throw error
    }
  }

  /**
   * Procesar una empresa específica por RUC
   * @param ruc RUC de la empresa
   * @param companyName Nombre de la empresa (opcional, para logs)
   */
  public async processCompany(ruc: string, companyName?: string): Promise<void> {
    try {
      const displayName = companyName || ruc
      console.log(`\nProcesando: ${displayName} (RUC: ${ruc})`)

      // Obtener credenciales desencriptadas
      const decryptedCreds = await this.credentialsDatasource.getDecryptedByRuc(ruc)

      if (!decryptedCreds) {
        console.log(`No se pudo desencriptar credenciales de ${displayName}`)
        return
      }

      // Crear instancia del servicio SRI
      const sriService = new SRIService(ruc)
      
      const config = {
        ruc: decryptedCreds.ruc,
        password: decryptedCreds.password, // Contraseña desencriptada
        descargasDir: this.descargasDir
      }

      // Descargar facturas
      await sriService.descargarInvoices(config)
      console.log(`Facturas descargadas para ${displayName}`)
    } catch (error) {
      const displayName = companyName || ruc
      console.error(`Error procesando ${displayName}:`, error)
      // No lanzar el error para permitir que continúe con las siguientes empresas
    }
  }

  /**
   * Utilidad para esperar un tiempo determinado
   * @param ms Milisegundos a esperar
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
