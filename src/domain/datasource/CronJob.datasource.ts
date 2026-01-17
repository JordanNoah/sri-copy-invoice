import { CronJobEntity } from '../entity/CronJob';
import { CronJobDto, CronJobStatisticsDto } from '../dto/CronJob';

/**
 * Contrato del datasource de CronJob
 */
export abstract class CronJobDatasource {
  /**
   * Crear o actualizar un cronjob (upsert)
   * @param id null para crear, número para actualizar
   */
  abstract upsert(id: number | null, cronJobDto: CronJobDto): Promise<CronJobEntity>;

  /**
   * Obtener todos los cronjobs
   */
  abstract getAll(): Promise<CronJobEntity[]>;

  /**
   * Obtener un cronjob por ID
   */
  abstract getById(id: number): Promise<CronJobEntity | null>;

  /**
   * Obtener un cronjob por jobUuid
   */
  abstract getByJobUuid(jobUuid: string): Promise<CronJobEntity | null>;

  /**
   * Obtener todos los cronjobs activos
   */
  abstract getAllActive(): Promise<CronJobEntity[]>;

  /**
   * Cambiar el estado activo/inactivo de un cronjob
   */
  abstract toggleStatus(id: number): Promise<boolean>;

  /**
   * Registrar la ejecución de un cronjob
   */
  abstract recordExecution(jobUuid: string, success: boolean, error?: string): Promise<void>;

  /**
   * Eliminar un cronjob
   */
  abstract delete(id: number): Promise<boolean>;

  /**
   * Obtener estadísticas de los cronjobs
   */
  abstract getStatistics(): Promise<CronJobStatisticsDto>;

  /**
   * Buscar cronjobs por criterios
   */
  abstract search(criteria: {
    isActive?: boolean;
    jobUuid?: string;
    limit?: number;
    offset?: number;
  }): Promise<CronJobEntity[]>;

  /**
   * Contar total de cronjobs
   */
  abstract count(): Promise<number>;
}
