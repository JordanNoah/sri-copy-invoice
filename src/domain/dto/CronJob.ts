/**
 * DTO para crear o actualizar un CronJob
 */
export class CronJobDto {
  constructor(
    public jobUuid: string,
    public schedule: string,
    public executablePath: string,
    public isActive?: boolean,
    public description?: string,
    public lastExecution?: Date,
    public nextExecution?: Date,
    public lastError?: string
  ) {}
}

/**
 * DTO para estadísticas de CronJob
 */
export class CronJobStatisticsDto {
  constructor(
    public total: number,
    public active: number,
    public inactive: number,
    public mostUsed?: {
      jobUuid: string;
      executionCount: number;
    }
  ) {}
}

/**
 * DTO para ejecución de CronJob
 */
export class CronJobExecutionDto {
  constructor(
    public jobUuid: string,
    public success: boolean,
    public error?: string,
    public executedAt: Date = new Date()
  ) {}
}
