"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronJobEntity = void 0;
/**
 * Entidad de dominio para CronJob
 */
class CronJobEntity {
    constructor(id, jobUuid, schedule, executablePath, isActive, description, lastExecution, nextExecution, executionCount, lastError, createdAt, updatedAt) {
        this.id = id;
        this.jobUuid = jobUuid;
        this.schedule = schedule;
        this.executablePath = executablePath;
        this.isActive = isActive;
        this.description = description;
        this.lastExecution = lastExecution;
        this.nextExecution = nextExecution;
        this.executionCount = executionCount;
        this.lastError = lastError;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    /**
     * Marcar como ejecutado
     */
    markAsExecuted(error) {
        this.lastExecution = new Date();
        this.executionCount = (this.executionCount || 0) + 1;
        if (error) {
            this.lastError = error;
        }
    }
    /**
     * Cambiar estado activo/inactivo
     */
    toggleActive() {
        this.isActive = !this.isActive;
    }
    /**
     * Obtener si está activo
     */
    getIsActive() {
        return this.isActive;
    }
    /**
     * Obtener el UUID del job
     */
    getJobUuid() {
        return this.jobUuid;
    }
    /**
     * Obtener la ruta ejecutable
     */
    getExecutablePath() {
        return this.executablePath;
    }
    /**
     * Obtener la expresión cron
     */
    getSchedule() {
        return this.schedule;
    }
    /**
     * Obtener estadísticas
     */
    getStats() {
        return {
            lastExecution: this.lastExecution,
            executionCount: this.executionCount || 0,
            lastError: this.lastError,
        };
    }
    fromRow(row) {
        return new CronJobEntity(row.id, row.jobUuid, row.schedule, row.executablePath, row.isActive, row.description, row.lastExecution, row.nextExecution, row.executionCount, row.lastError, row.createdAt, row.updatedAt);
    }
}
exports.CronJobEntity = CronJobEntity;
