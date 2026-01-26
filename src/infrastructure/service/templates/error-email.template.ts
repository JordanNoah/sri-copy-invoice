import env from '@/shared/env';

export interface ErrorEmailData {
    service: string;
    error: Error;
    context?: Record<string, any>;
    timestamp: Date;
    companyRuc?: string;
}

/**
 * Generate HTML template for error emails
 */
export function generateErrorEmailHTML(data: ErrorEmailData): string {
    const { service, error, context, timestamp, companyRuc } = data;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 30px -30px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .info-section {
            background-color: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-item {
            margin: 10px 0;
        }
        .info-label {
            font-weight: 600;
            color: #991b1b;
            display: inline-block;
            min-width: 120px;
        }
        .error-details {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 15px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .context-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .context-table th,
        .context-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .context-table th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
        }
        .context-table td {
            word-break: break-word;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 Error Detectado</h1>
        </div>
        
        <div class="info-section">
            <div class="info-item">
                <span class="info-label">Servicio:</span>
                <strong>${escapeHtml(service)}</strong>
            </div>
            <div class="info-item">
                <span class="info-label">Fecha y Hora:</span>
                ${timestamp.toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}
            </div>
            ${companyRuc ? `
            <div class="info-item">
                <span class="info-label">RUC Empresa:</span>
                ${escapeHtml(companyRuc)}
            </div>
            ` : ''}
            <div class="info-item">
                <span class="info-label">Tipo de Error:</span>
                ${escapeHtml(error.name || 'Error')}
            </div>
        </div>

        <h3>Mensaje de Error:</h3>
        <div class="error-details">${escapeHtml(error.message || 'No se proporcionó mensaje de error')}</div>

        ${error.stack ? `
        <h3>Stack Trace:</h3>
        <div class="error-details">${escapeHtml(error.stack)}</div>
        ` : ''}

        ${context && Object.keys(context).length > 0 ? `
        <h3>Contexto Adicional:</h3>
        <table class="context-table">
            <thead>
                <tr>
                    <th>Propiedad</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(context)
                    .map(
                        ([key, value]) => `
                <tr>
                    <td><strong>${escapeHtml(key)}</strong></td>
                    <td>${escapeHtml(JSON.stringify(value, null, 2))}</td>
                </tr>
                `
                    )
                    .join('')}
            </tbody>
        </table>
        ` : ''}

        <div class="footer">
            <p>
                Este es un correo automático del sistema SRI Invoice Copy.<br>
                Ambiente: ${env.NODE_ENV}
            </p>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Generate plain text version of error email
 */
export function generateErrorEmailText(data: ErrorEmailData): string {
    const { service, error, context, timestamp, companyRuc } = data;

    let text = `
ERROR DETECTADO EN EL SISTEMA
==============================

Servicio: ${service}
Fecha y Hora: ${timestamp.toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}
${companyRuc ? `RUC Empresa: ${companyRuc}\n` : ''}
Tipo de Error: ${error.name || 'Error'}

MENSAJE DE ERROR:
${error.message || 'No se proporcionó mensaje de error'}

${error.stack ? `\nSTACK TRACE:\n${error.stack}\n` : ''}
`;

    if (context && Object.keys(context).length > 0) {
        text += '\nCONTEXTO ADICIONAL:\n';
        Object.entries(context).forEach(([key, value]) => {
            text += `${key}: ${JSON.stringify(value, null, 2)}\n`;
        });
    }

    text += `\n---\nAmbiente: ${env.NODE_ENV}\n`;

    return text;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
}
