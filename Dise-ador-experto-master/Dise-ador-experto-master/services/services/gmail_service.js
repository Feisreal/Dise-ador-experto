/**
 * Gmail MCP Service Integration
 * Gestiona la comunicación por correo electrónico a través de la API de Gmail
 */

const { spawn } = require('child_process');

class GmailService {
    constructor() {
        this.mcp_server = 'gmail';
    }

    /**
     * Envía un correo de confirmación de compra
     * @param {Object} data - {to, subject, name, plan, price, purchaseDate}
     */
    async sendConfirmationEmail(data) {
        try {
            const { to, subject, name, plan, price, purchaseDate } = data;

            const emailContent = `
Hola ${name},

¡Gracias por comprar el plan ${plan} de FEISS Showcase Store!

Detalles de tu compra:
- Plan: ${plan}
- Precio: $${price}
- Fecha: ${new Date(purchaseDate).toLocaleDateString('es-ES')}
- Estado: ✓ Completado

Próximos pasos:
1. Accede a tu cuenta con este email
2. Descarga la documentación completa
3. Comienza con la guía de implementación
4. Contacta soporte si tienes preguntas

¡Bienvenido a FEISS!

Saludos,
Equipo FEISS
            `;

            const result = await this.callMCPTool('gmail_send_messages', {
                messages: [
                    {
                        to: [to],
                        subject: subject || `¡Bienvenido a FEISS! - Plan ${plan}`,
                        content: emailContent
                    }
                ]
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error enviando email de confirmación:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Busca correos en Gmail
     * @param {String} query - Consulta de búsqueda
     */
    async searchEmails(query) {
        try {
            const result = await this.callMCPTool('gmail_search_messages', {
                q: query,
                max_results: 50
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error buscando correos:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Lee un hilo de correos
     * @param {Array} threadIds - IDs de los hilos
     */
    async readThreads(threadIds) {
        try {
            const result = await this.callMCPTool('gmail_read_threads', {
                thread_ids: threadIds,
                include_full_messages: true
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error leyendo hilos:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Gestiona etiquetas en Gmail
     * @param {String} operation - Operación: list, create, apply, remove
     * @param {Object} params - Parámetros específicos de la operación
     */
    async manageLabels(operation, params) {
        try {
            const result = await this.callMCPTool('gmail_manage_labels', {
                operation: operation,
                ...params
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error gestionando etiquetas:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Llama a una herramienta MCP a través de manus-mcp-cli
     * @param {String} toolName - Nombre de la herramienta
     * @param {Object} input - Parámetros de entrada
     */
    async callMCPTool(toolName, input) {
        return new Promise((resolve, reject) => {
            const process = spawn('manus-mcp-cli', [
                'tool',
                'call',
                toolName,
                '--server',
                this.mcp_server,
                '--input',
                JSON.stringify(input)
            ]);

            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    try {
                        resolve(JSON.parse(stdout));
                    } catch (e) {
                        resolve(stdout);
                    }
                } else {
                    reject(new Error(stderr || `Proceso terminado con código ${code}`));
                }
            });
        });
    }
}

module.exports = new GmailService();
