# Explicación Detallada de Integraciones de API en FEISS

Este documento explica cómo cada API individual se integra en el flujo de trabajo de la plataforma FEISS, tal como se muestra en el diagrama de flujo.

## 1. Integración con Gmail (Comunicación y Soporte)

La API de Gmail actúa como el canal principal de comunicación directa con el usuario.

*   **Flujo de Venta**: Una vez que el backend recibe la confirmación de éxito de Stripe, se dispara una llamada a la API de Gmail para enviar un correo electrónico de bienvenida. A diferencia de un envío simple, esta integración permite rastrear si el correo fue entregado y organizar la comunicación bajo etiquetas específicas (ej. "Ventas FEISS").
*   **Flujo de Soporte**: Cuando un usuario envía el formulario de contacto, el sistema utiliza Gmail para crear un hilo de conversación. Se pueden aplicar etiquetas automáticas según el asunto del mensaje para que el equipo de soporte pueda priorizar las consultas directamente desde su bandeja de entrada.

## 2. Integración con Google Calendar (Programación de Eventos)

Esta API gestiona el tiempo y las citas entre el equipo de FEISS y sus clientes potenciales.

*   **Reserva de Demos**: En la interfaz web, el usuario interactúa con un selector de fechas. Al confirmar, el backend envía una solicitud a la API de Google Calendar para crear un evento.
*   **Automatización de Invitaciones**: El evento no solo se registra en el calendario de FEISS, sino que envía automáticamente una invitación al correo del usuario, incluyendo enlaces de videoconferencia si es necesario, eliminando la gestión manual de citas.

## 3. Integración con Notion (Gestión de Contenido y Conocimiento)

Notion funciona como el "cerebro" de la documentación y el registro de datos no estructurados.

*   **Documentación Dinámica**: En lugar de tener archivos HTML estáticos para la documentación, la web consulta la API de Notion para obtener el contenido de páginas específicas. Esto permite que cualquier cambio realizado en Notion se refleje instantáneamente en la web sin necesidad de nuevos despliegues de código.
*   **Registro de Consultas**: Las solicitudes de soporte no solo se envían por correo, sino que se registran simultáneamente en una base de datos de Notion. Esto crea un historial estructurado que permite analizar tendencias de problemas o preguntas frecuentes de los usuarios.

## 4. Integración con Zapier (Ecosistema y Automatización Extendida)

Zapier actúa como el conector universal para servicios que no tienen una integración directa programada en el servidor.

*   **Automatización Post-Venta**: Al detectar un nuevo pago exitoso, el backend puede enviar un "webhook" a Zapier.
*   **Conexión con Terceros**: Zapier se encarga de distribuir esa información a otras herramientas:
    *   **CRM**: Registra al nuevo cliente en HubSpot o Salesforce.
    *   **Marketing**: Añade el correo a una lista de automatización en Mailchimp.
    *   **Notificaciones**: Envía una alerta al canal de ventas en Slack para que el equipo esté al tanto en tiempo real.

---

### Resumen de Interacciones

| API | Función Principal | Punto de Activación | Resultado |
| :--- | :--- | :--- | :--- |
| **Gmail** | Comunicación | Pago exitoso / Formulario contacto | Email enviado y etiquetado |
| **Google Calendar** | Citas | Formulario de reserva | Evento creado con invitación |
| **Notion** | CMS / Base de Datos | Carga de página / Soporte | Contenido dinámico / Registro histórico |
| **Zapier** | Orquestación | Eventos de sistema (Webhooks) | Sincronización con CRM y Slack |
