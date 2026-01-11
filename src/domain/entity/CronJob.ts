import { CronJobSequelize } from "@/infrastructure/database/models/CronJob";

/**
 * Entidad de dominio para CronJob
 */
export class CronJobEntity {
  constructor(
    public id: number,
    public jobUuid: string,
    public schedule: string,
    public executablePath: string,
    public isActive: boolean,
    public description?: string,
    public lastExecution?: Date,
    public nextExecution?: Date,
    public executionCount?: number,
    public lastError?: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  /**
   * Marcar como ejecutado
   */
  public markAsExecuted(error?: string): void {
    this.lastExecution = new Date();
    this.executionCount = (this.executionCount || 0) + 1;
    if (error) {
      this.lastError = error;
    }
  }

  /**
   * Cambiar estado activo/inactivo
   */
  public toggleActive(): void {
    this.isActive = !this.isActive;
  }

  /**
   * Obtener si está activo
   */
  public getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Obtener el UUID del job
   */
  public getJobUuid(): string {
    return this.jobUuid;
  }

  /**
   * Obtener la ruta ejecutable
   */
  public getExecutablePath(): string {
    return this.executablePath;
  }

  /**
   * Obtener la expresión cron
   */
  public getSchedule(): string {
    return this.schedule;
  }

  /**
   * Obtener estadísticas
   */
  public getStats(): {
    lastExecution?: Date;
    executionCount: number;
    lastError?: string;
  } {
    return {
      lastExecution: this.lastExecution,
      executionCount: this.executionCount || 0,
      lastError: this.lastError,
    };
  }

  public fromRow(row: CronJobSequelize): CronJobEntity {
    return new CronJobEntity(
      row.id,
      row.jobUuid,
      row.schedule,
      row.executablePath,
      row.isActive,
      row.description,
      row.lastExecution,
      row.nextExecution,
      row.executionCount,
      row.lastError,
      row.createdAt,
      row.updatedAt
    );
  }
}