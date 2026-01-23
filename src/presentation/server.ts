import { Hono } from 'hono'
import ENV from '@/shared/env'
import {cors} from "hono/cors"
import {serve} from "@hono/node-server"
import { DbSequelize } from '@/infrastructure/database/init'
import AppRoutes from './routes'
import { cronJobService } from '@/infrastructure/service/cronjob'
import { SRIAutomationService } from '@/infrastructure/service/sri-automation.service'

export class Server {
  public readonly app: Hono
  private readonly port: number
  
  constructor() {
    this.app = new Hono()
    this.port = ENV.PORT
  }

  public async start(): Promise<void> {
    try {
      console.time('start server')

      await DbSequelize()
      this.cors()
      this.routes()
      this.server()
      this.setupCronJobs()

      console.timeEnd('start server')
    } catch (error) {
      console.error('Error starting server', error)
    }
  }

  private routes(): void {
    this.app.route('/', new AppRoutes().routes)
  }

  public cors(): void {
    this.app.use('*', async (c, next) => {
      const corsMiddleware = cors()
      return await corsMiddleware(c, next)
    })
  }

  public server(): void {
    const httpServer = serve(
      {
        fetch: this.app.fetch,
        port: this.port,
      },
      (info) => {
        console.log(`Server is running on port ${info.port}`)
      },
    )
  }

  /**
   * Configurar cronjobs para tareas automatizadas
   */
  private setupCronJobs(): void {
    const sriAutomationService = new SRIAutomationService()

    // Cronjob para descarga automática de facturas del SRI
    cronJobService.createJob({
      jobUuid: 'sri-download-invoices',
      schedule: '0 2 * * *', // Ejecutar todos los días a las 2:00 AM
      description: 'Descarga automática de facturas del SRI para todas las empresas',
      runOnInit: false, // Cambiar a true si quieres que se ejecute al iniciar el servidor
      task: async () => {
        await sriAutomationService.processAllCompanies()
      }
    })

    console.log('Cronjobs configurados correctamente')
  }
}