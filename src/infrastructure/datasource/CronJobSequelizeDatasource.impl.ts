import { CronJobDatasource } from '@/domain/datasource/CronJob.datasource';
import { CronJobEntity } from '@/domain/entity/CronJob';
import { CronJobDto, CronJobStatisticsDto } from '@/domain/dto/CronJob';
import { CronJobSequelize } from '@/infrastructure/database/models/CronJob';

/**
 * Implementación del datasource de CronJob usando Sequelize
 */
export class CronJobSequelizeDatasource extends CronJobDatasource {
  /**
   * Crear o actualizar un cronjob (upsert)
   * @param id null para crear, número para actualizar
   */
  async upsert(id: number | null, cronJobDto: CronJobDto): Promise<CronJobEntity> {
    if (id === null) {
      // Crear nuevo
      const cronJob = await CronJobSequelize.create({
        jobUuid: cronJobDto.jobUuid,
        schedule: cronJobDto.schedule,
        executablePath: cronJobDto.executablePath,
        isActive: cronJobDto.isActive ?? true,
        description: cronJobDto.description,
        executionCount: 0,
      });
      return this.mapToEntity(cronJob);
    } else {
      // Actualizar existente
      const cronJob = await CronJobSequelize.findByPk(id);
      if (!cronJob) {
        throw new Error(`Cronjob con ID ${id} no encontrado`);
      }

      await cronJob.update({
        jobUuid: cronJobDto.jobUuid ?? cronJob.jobUuid,
        schedule: cronJobDto.schedule ?? cronJob.schedule,
        executablePath: cronJobDto.executablePath ?? cronJob.executablePath,
        isActive: cronJobDto.isActive ?? cronJob.isActive,
        description: cronJobDto.description ?? cronJob.description,
        lastExecution: cronJobDto.lastExecution ?? cronJob.lastExecution,
        nextExecution: cronJobDto.nextExecution ?? cronJob.nextExecution,
        lastError: cronJobDto.lastError ?? cronJob.lastError,
      });

      return this.mapToEntity(cronJob);
    }
  }

  /**
   * Obtener todos los cronjobs
   */
  async getAll(): Promise<CronJobEntity[]> {
    const cronJobs = await CronJobSequelize.findAll();
    return cronJobs.map((cron) => this.mapToEntity(cron));
  }

  /**
   * Obtener un cronjob por ID
   */
  async getById(id: number): Promise<CronJobEntity | null> {
    const cronJob = await CronJobSequelize.findByPk(id);
    return cronJob ? this.mapToEntity(cronJob) : null;
  }

  /**
   * Obtener un cronjob por jobUuid
   */
  async getByJobUuid(jobUuid: string): Promise<CronJobEntity | null> {
    const cronJob = await CronJobSequelize.findOne({ where: { jobUuid } });
    return cronJob ? this.mapToEntity(cronJob) : null;
  }

  /**
   * Obtener todos los cronjobs activos
   */
  async getAllActive(): Promise<CronJobEntity[]> {
    const cronJobs = await CronJobSequelize.findAll({ where: { isActive: true } });
    return cronJobs.map((cron) => this.mapToEntity(cron));
  }

  /**
   * Cambiar el estado activo/inactivo de un cronjob
   */
  async toggleStatus(id: number): Promise<boolean> {
    const cronJob = await CronJobSequelize.findByPk(id);
    if (!cronJob) {
      return false;
    }

    await cronJob.update({ isActive: !cronJob.isActive });
    return true;
  }

  /**
   * Registrar la ejecución de un cronjob
   */
  async recordExecution(jobUuid: string, success: boolean, error?: string): Promise<void> {
    const cronJob = await CronJobSequelize.findOne({ where: { jobUuid } });
    if (!cronJob) {
      throw new Error(`Cronjob con UUID ${jobUuid} no encontrado`);
    }

    await cronJob.update({
      lastExecution: new Date(),
      lastError: error || undefined,
      executionCount: (cronJob.executionCount ?? 0) + 1,
    });
  }

  /**
   * Eliminar un cronjob
   */
  async delete(id: number): Promise<boolean> {
    const result = await CronJobSequelize.destroy({ where: { id } });
    return result > 0;
  }

  /**
   * Obtener estadísticas de los cronjobs
   */
  async getStatistics(): Promise<CronJobStatisticsDto> {
    const total = await CronJobSequelize.count();
    const active = await CronJobSequelize.count({ where: { isActive: true } });
    const inactive = total - active;

    const mostUsed = await CronJobSequelize.findOne({
      order: [['executionCount', 'DESC']],
      attributes: ['jobUuid', 'executionCount'],
    });

    return new CronJobStatisticsDto(
      total,
      active,
      inactive,
      mostUsed
        ? {
            jobUuid: mostUsed.jobUuid,
            executionCount: mostUsed.executionCount ?? 0,
          }
        : undefined
    );
  }

  /**
   * Buscar cronjobs por criterios
   */
  async search(criteria: {
    isActive?: boolean;
    jobUuid?: string;
    limit?: number;
    offset?: number;
  }): Promise<CronJobEntity[]> {
    const where: any = {};

    if (criteria.isActive !== undefined) {
      where.isActive = criteria.isActive;
    }

    if (criteria.jobUuid) {
      where.jobUuid = criteria.jobUuid;
    }

    const options: any = { where };

    if (criteria.limit) {
      options.limit = criteria.limit;
    }

    if (criteria.offset) {
      options.offset = criteria.offset;
    }

    const cronJobs = await CronJobSequelize.findAll(options);
    return cronJobs.map((cron) => this.mapToEntity(cron));
  }

  /**
   * Contar total de cronjobs
   */
  async count(): Promise<number> {
    return CronJobSequelize.count();
  }

  /**
   * Mapear modelo de Sequelize a entidad del domain
   */
  private mapToEntity(cronJob: CronJobSequelize): CronJobEntity {
    return new CronJobEntity(
      cronJob.id,
      cronJob.jobUuid,
      cronJob.schedule,
      cronJob.executablePath,
      cronJob.isActive,
      cronJob.description,
      cronJob.lastExecution,
      cronJob.nextExecution,
      cronJob.executionCount,
      cronJob.lastError,
      cronJob.createdAt,
      cronJob.updatedAt
    );
  }
}
