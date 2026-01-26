/**
 * Email Templates Export
 * 
 * Templates para notificaciones por email del sistema.
 * Actualmente solo se usan los templates de error.
 */

export {
    generateErrorEmailHTML,
    generateErrorEmailText,
    type ErrorEmailData,
} from './error-email.template';

// Templates de éxito disponibles pero no utilizados actualmente
// (solo enviamos emails cuando hay errores)
export {
    generateSuccessEmailHTML,
    generateSuccessEmailText,
    type SuccessEmailData,
} from './success-email.template';
