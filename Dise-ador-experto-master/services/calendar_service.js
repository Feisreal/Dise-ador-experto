/**
 * Google Calendar MCP Service Integration
 * Gestiona la programación de eventos y citas
 */

const { spawn } = require('child_process');

class CalendarService {
    constructor() {
        this.mcp_server = 'google-calendar';
        this.calendar_id = 'primary';
    }

    /**
     * Crea un evento de demostración
     * @param {Object} data - {email, name, date, time, duration}
     */
    async createDemoEvent(data) {
        try {
            const { email, name, date, time, duration = 60 } = data;

            const startTime = new Date(`${date}T${time}:00`);
            const endTime = new Date(startTime.getTime() + duration * 60000);

            const result = await this.callMCPTool('google_calendar_create_events', {
                events: [
                    {
                        summary: `Demo FEISS - ${name}`,
                        description: `Sesión de demostración de FEISS Showcase Store para ${name}`,
                        start_time: startTime.toISOString(),
                        end_time: endTime.toISOString(),
                        location: 'Videoconferencia',
                        attendees: [email],
                        reminders: [15, 1440],
                        calendar_id: this.calendar_id
                    }
                ]
            });

            return { success: true, data: result, eventDetails: { email, name, date, time } };
        } catch (error) {
            console.error('Error creando evento de demo:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Busca eventos disponibles en el calendario
     * @param {String} timeMin - Fecha mínima (RFC3339)
     * @param {String} timeMax - Fecha máxima (RFC3339)
     */
    async searchAvailableSlots(timeMin, timeMax) {
        try {
            const result = await this.callMCPTool('google_calendar_search_events', {
                calendar_id: this.calendar_id,
                time_min: timeMin,
                time_max: timeMax,
                max_results: 100
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error buscando espacios disponibles:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtiene los detalles de un evento específico
     * @param {String} eventId - ID del evento
     */
    async getEventDetails(eventId) {
        try {
            const result = await this.callMCPTool('google_calendar_get_event', {
                event_id: eventId,
                calendar_id: this.calendar_id
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error obteniendo detalles del evento:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualiza un evento existente
     * @param {String} eventId - ID del evento
     * @param {Object} updates - Campos a actualizar
     */
    async updateEvent(eventId, updates) {
        try {
            const result = await this.callMCPTool('google_calendar_update_events', {
                events: [
                    {
                        event_id: eventId,
                        calendar_id: this.calendar_id,
                        ...updates
                    }
                ]
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error actualizando evento:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Elimina un evento
     * @param {String} eventId - ID del evento
     */
    async deleteEvent(eventId) {
        try {
            const result = await this.callMCPTool('google_calendar_delete_events', {
                events: [
                    {
                        event_id: eventId,
                        calendar_id: this.calendar_id
                    }
                ]
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error eliminando evento:', error);
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

module.exports = new CalendarService();
