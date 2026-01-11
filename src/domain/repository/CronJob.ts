import { CronJobEntity } from '../entity/CronJob';
import {
  CronJobDto,
  CronJobStatisticsDto,
} from '../dto/CronJob';

/**
 * Contrato del repositorio de CronJob
 */
export interface CronJobRepository {
  /**
   * Crear o actualizar un cronjob (upsert)
   * @param id null para crear, número para actualizar
   */
  upsert(id: number | null, cronJobDto: CronJobDto): Promise<CronJobEntity>;

  /**
   * Obtener todos los cronjobs
   */
  getAll(): Promise<CronJobEntity[]>;

  /**
   * Obtener un cronjob por ID
   */
  getById(id: number): Promise<CronJobEntity | null>;

  /**
   * Obtener un cronjob por jobUuid
   */
  getByJobUuid(jobUuid: string): Promise<CronJobEntity | null>;

  /**
   * Obtener todos los cronjobs activos
   */
  getAllActive(): Promise<CronJobEntity[]>;

  /**
   * Cambiar el estado activo/inactivo de un cronjob
   */
  toggleStatus(id: number): Promise<boolean>;

  /**
   * Registrar la ejecución de un cronjob
   */
  recordExecution(jobUuid: string, success: boolean, error?: string): Promise<void>;

  /**
   * Eliminar un cronjob
   */
  delete(id: number): Promise<boolean>;

  /**
   * Obtener estadísticas de los cronjobs
   */
  getStatistics(): Promise<CronJobStatisticsDto>;

  /**
   * Buscar cronjobs por criterios
   */
  search(criteria: {
    isActive?: boolean;
    jobUuid?: string;
    limit?: number;
    offset?: number;
  }): Promise<CronJobEntity[]>;

  /**
   * Contar total de cronjobs
   */
  count(): Promise<number>;
}
