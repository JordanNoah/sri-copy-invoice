"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronJobExecutionDto = exports.CronJobStatisticsDto = exports.CronJobDto = void 0;
/**
 * DTO para crear o actualizar un CronJob
 */
class CronJobDto {
    constructor(jobUuid, schedule, executablePath, isActive, description, lastExecution, nextExecution, lastError) {
        this.jobUuid = jobUuid;
        this.schedule = schedule;
        this.executablePath = executablePath;
        this.isActive = isActive;
        this.description = description;
        this.lastExecution = lastExecution;
        this.nextExecution = nextExecution;
        this.lastError = lastError;
    }
}
exports.CronJobDto = CronJobDto;
/**
 * DTO para estadísticas de CronJob
 */
class CronJobStatisticsDto {
    constructor(total, active, inactive, mostUsed) {
        this.total = total;
        this.active = active;
        this.inactive = inactive;
        this.mostUsed = mostUsed;
    }
}
exports.CronJobStatisticsDto = CronJobStatisticsDto;
/**
 * DTO para ejecución de CronJob
 */
class CronJobExecutionDto {
    constructor(jobUuid, success, error, executedAt = new Date()) {
        this.jobUuid = jobUuid;
        this.success = success;
        this.error = error;
        this.executedAt = executedAt;
    }
}
exports.CronJobExecutionDto = CronJobExecutionDto;
