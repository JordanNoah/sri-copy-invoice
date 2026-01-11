import { Hono } from 'hono'
import ENV from '@/shared/env'
import {cors} from "hono/cors"
import {serve} from "@hono/node-server"
import { DbSequelize } from '@/infrastructure/database/init'
import AppRoutes from './routes'

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
}
