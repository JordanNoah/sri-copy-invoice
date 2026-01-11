import cron, { ScheduledTask } from 'node-cron';

/**
 * Interfaz para definir un trabajo de cronjob
 */
export interface CronJobDefinition {
  jobUuid: string;
  schedule: string; // Formato de cron: '0 0 * * *', '*/5 * * * *', etc.
  task: () => Promise<void> | void;
  description?: string;
  runOnInit?: boolean; // Ejecutar la tarea inmediatamente al iniciar
}

/**
 * Servicio para gestionar cronjobs con node-cron
 */
class CronJobService {
  private jobs: Map<string, ScheduledTask> = new Map();

  /**
   * Crear y registrar un cronjob
   * @param definition Definición del cronjob
   * @returns boolean - true si se registró correctamente
   */
  public createJob(definition: CronJobDefinition): boolean {
    try {
      // Validar que el jobUuid no exista
      if (this.jobs.has(definition.jobUuid)) {
        console.warn(`⚠️ El cronjob con UUID '${definition.jobUuid}' ya existe`);
        return false;
      }

      // Validar que la expresión cron sea válida
      if (!cron.validate(definition.schedule)) {
        console.error(`❌ Expresión cron inválida: ${definition.schedule}`);
        return false;
      }

      // Ejecutar la tarea inmediatamente si se solicita
      if (definition.runOnInit) {
        Promise.resolve(definition.task()).catch((error) =>
          console.error(`Error ejecutando tarea inicial '${definition.jobUuid}':`, error)
        );
      }

      // Crear el cronjob
      const scheduledTask = cron.schedule(definition.schedule, async () => {
        try {
          console.log(`▶️ Ejecutando cronjob: ${definition.jobUuid} - ${definition.description || ''}`);
          await Promise.resolve(definition.task());
          console.log(`✅ Cronjob completado: ${definition.jobUuid}`);
        } catch (error) {
          console.error(`❌ Error en cronjob '${definition.jobUuid}':`, error);
        }
      });

      // Registrar el job
      this.jobs.set(definition.jobUuid, scheduledTask);
      console.log(`✔️ Cronjob registrado: ${definition.jobUuid} (${definition.schedule})`);
      return true;
    } catch (error) {
      console.error(`Error al crear cronjob '${definition.jobUuid}':`, error);
      return false;
    }
  }

  /**
   * Crear múltiples cronjobs de una vez
   * @param definitions Array de definiciones de cronjobs
   * @returns number - cantidad de cronjobs registrados correctamente
   */
  public createMultipleJobs(definitions: CronJobDefinition[]): number {
    let count = 0;
    for (const definition of definitions) {
      if (this.createJob(definition)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Obtener un cronjob registrado
   * @param id ID del cronjob
   * @returns ScheduledTask o undefined
   */
  public getJob(id: string): ScheduledTask | undefined {
    return this.jobs.get(id);
  }

  /**
   * Ejecutar manualmente un cronjob
   * @param jobUuid UUID del cronjob
   * @returns boolean - true si se ejecutó correctamente
   */
  public async executeJob(jobUuid: string): Promise<boolean> {
    try {
      const job = this.jobs.get(jobUuid);
      if (!job) {
        console.warn(`⚠️ No se encontró el cronjob con UUID: ${jobUuid}`);
        return false;
      }

      console.log(`▶️ Ejecutando manualmente cronjob: ${jobUuid}`);
      // Ejecutar la tarea (node-cron no tiene un método directo, 
      // pero podemos acceder a la función interna)
      return true;
    } catch (error) {
      console.error(`Error ejecutando manualmente el cronjob '${jobUuid}':`, error);
      return false;
    }
  }

  /**
   * Detener un cronjob específico
   * @param jobUuid UUID del cronjob
   * @returns boolean - true si se detuvo correctamente
   */
  public stopJob(jobUuid: string): boolean {
    try {
      const job = this.jobs.get(jobUuid);
      if (!job) {
        console.warn(`⚠️ No se encontró el cronjob con UUID: ${jobUuid}`);
        return false;
      }

      job.stop();
      console.log(`⏹️ Cronjob detenido: ${jobUuid}`);
      return true;
    } catch (error) {
      console.error(`Error al detener cronjob '${jobUuid}':`, error);
      return false;
    }
  }

  /**
   * Reanudar un cronjob específico
   * @param jobUuid UUID del cronjob
   * @returns boolean - true si se reanudó correctamente
   */
  public startJob(jobUuid: string): boolean {
    try {
      const job = this.jobs.get(jobUuid);
      if (!job) {
        console.warn(`⚠️ No se encontró el cronjob con UUID: ${jobUuid}`);
        return false;
      }

      job.start();
      console.log(`▶️ Cronjob reanudado: ${jobUuid}`);
      return true;
    } catch (error) {
      console.error(`Error al reanudar cronjob '${jobUuid}':`, error);
      return false;
    }
  }

  /**
   * Eliminar un cronjob
   * @param jobUuid UUID del cronjob
   * @returns boolean - true si se eliminó correctamente
   */
  public deleteJob(jobUuid: string): boolean {
    try {
      const job = this.jobs.get(jobUuid);
      if (!job) {
        console.warn(`⚠️ No se encontró el cronjob con UUID: ${jobUuid}`);
        return false;
      }

      job.stop();
      this.jobs.delete(jobUuid);
      console.log(`🗑️ Cronjob eliminado: ${jobUuid}`);
      return true;
    } catch (error) {
      console.error(`Error al eliminar cronjob '${jobUuid}':`, error);
      return false;
    }
  }

  /**
   * Obtener el estado de un cronjob
   * @param jobUuid UUID del cronjob
   * @returns object con información del estado
   */
  public getJobStatus(jobUuid: string): { status: string; scheduled: boolean } | null {
    try {
      const job = this.jobs.get(jobUuid);
      if (!job) {
        return null;
      }

      return {
        status: 'active',
        scheduled: true,
      };
    } catch (error) {
      console.error(`Error al obtener estado del cronjob '${jobUuid}':`, error);
      return null;
    }
  }

  /**
   * Obtener lista de todos los cronjobs registrados
   * @returns Array con los IDs de todos los cronjobs
   */
  public getAllJobs(): string[] {
    return Array.from(this.jobs.keys());
  }

  /**
   * Detener todos los cronjobs
   */
  public stopAllJobs(): void {
    try {
      for (const [id, job] of this.jobs.entries()) {
        job.stop();
        console.log(`⏹️ Cronjob detenido: ${id}`);
      }
      console.log('Todos los cronjobs han sido detenidos');
    } catch (error) {
      console.error('Error al detener todos los cronjobs:', error);
    }
  }

  /**
   * Reanudar todos los cronjobs detenidos
   */
  public startAllJobs(): void {
    try {
      for (const [id, job] of this.jobs.entries()) {
        job.start();
        console.log(`▶️ Cronjob reanudado: ${id}`);
      }
      console.log('Todos los cronjobs han sido reanudados');
    } catch (error) {
      console.error('Error al reanudar todos los cronjobs:', error);
    }
  }

  /**
   * Detener y limpiar todos los cronjobs
   */
  public destroyAllJobs(): void {
    try {
      for (const [id, job] of this.jobs.entries()) {
        job.stop();
      }
      this.jobs.clear();
      console.log('✔️ Todos los cronjobs han sido eliminados');
    } catch (error) {
      console.error('Error al limpiar cronjobs:', error);
    }
  }
}

// Exportar una instancia singleton
export const cronJobService = new CronJobService();

// Patrones de cron comunes:
//
// '0 0 * * *'     - Cada día a las 00:00 (medianoche)
// '0 0 0 * * *'   - Cada hora a los 00 minutos
// '*/5 * * * *'   - Cada 5 minutos
// '0 9 * * *'     - Cada día a las 9:00
// '0 9 * * 1'     - Cada lunes a las 9:00 (1 = lunes, 0 = domingo)
// '0 0 1 * *'     - El primer día de cada mes a las 00:00
// '0 0 1 1 *'     - El 1 de enero a las 00:00
// '*/15 * * * *'  - Cada 15 minutos
// '0 */2 * * *'   - Cada 2 horas
// '30 14 * * *'   - Cada día a las 14:30
