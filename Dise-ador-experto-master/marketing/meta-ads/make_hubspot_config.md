# Configuración de Make y HubSpot para la Integración de Leads de Meta Ads

Este documento describe los pasos detallados para configurar Make (anteriormente Integromat) y HubSpot, utilizando el servidor MCP de HubSpot, para procesar los leads captados a través de formularios de Meta Ads para la marca FEISS.

## 1. Configuración en Make (Integromat)

Make será el orquestador de este flujo de automatización. Los pasos a seguir son:

### 1.1. Módulo de Webhook Personalizado (Trigger)

1.  **Crear un nuevo escenario en Make.**
2.  **Añadir un módulo de "Webhooks"** y seleccionar "Custom webhook".
3.  **Generar una nueva dirección de webhook.** Esta URL será la que se configure en Meta Ads Manager para enviar los datos del formulario.
4.  **Estructura de datos (Data structure):** Make te pedirá que definas la estructura de los datos que esperas recibir. Para ello, puedes enviar un lead de prueba desde Meta Ads (usando la herramienta de prueba de Meta para desarrolladores) o introducir manualmente los campos que esperas recibir (ej. `email`, `first_name`, `phone_number`, `periferico_interes`, `tipo_juego`).

### 1.2. Módulo de HubSpot (Action)

1.  **Añadir un módulo de "HubSpot"** y seleccionar la acción "Create/Update a Contact" (Crear/Actualizar un Contacto).
2.  **Conexión:** Si es la primera vez, Make te guiará para conectar tu cuenta de HubSpot. Asegúrate de otorgar los permisos necesarios.
3.  **Mapeo de Campos:** Esta es la parte crucial. Deberás mapear los datos recibidos del webhook de Meta Ads a las propiedades de contacto de HubSpot.

    | Campo de Meta Ads (Webhook) | Propiedad de HubSpot (MCP) | Notas |
    | :-------------------------- | :------------------------- | :---- |
    | `email`                     | `email`                    | Campo estándar de email. |
    | `first_name`                | `firstname`                | Campo estándar de nombre. |
    | `last_name`                 | `lastname`                 | Campo estándar de apellido. |
    | `phone_number`              | `phone`                    | Campo estándar de teléfono. |
    | `periferico_interes`        | `feiss_periferico_interes` | **Propiedad personalizada** en HubSpot. |
    | `tipo_juego`                | `feiss_tipo_juego`         | **Propiedad personalizada** en HubSpot. |
    | `marca_actual`              | `feiss_marca_actual`       | **Propiedad personalizada** en HubSpot. |

    *   **Importante:** Las propiedades personalizadas (`feiss_periferico_interes`, `feiss_tipo_juego`, `feiss_marca_actual`) deben ser creadas previamente en HubSpot con el tipo de campo adecuado (ej. selección múltiple, texto de una línea) para que Make pueda mapearlas correctamente.

4.  **Configuración de Duplicados:** Asegúrate de que el módulo de HubSpot esté configurado para "Actualizar si existe" (Update if exists) basándose en el campo `email` para evitar duplicados.

## 2. Configuración en HubSpot (Vía MCP)

Para interactuar con HubSpot a través del MCP, utilizaremos la herramienta `manage_crm_objects`. Esta herramienta permite crear o actualizar objetos CRM, como contactos.

### 2.1. Creación de Propiedades Personalizadas

Antes de configurar Make, es fundamental crear las propiedades personalizadas en HubSpot para los datos específicos de los periféricos gaming. Esto se hace manualmente en la interfaz de HubSpot (Configuración > Propiedades).

*   **`feiss_periferico_interes`:**
    *   **Tipo de campo:** Selección múltiple o Menú desplegable.
    *   **Opciones:** Teclado mecánico, Auriculares Gaming, Monitor de alto rendimiento.
*   **`feiss_tipo_juego`:**
    *   **Tipo de campo:** Selección múltiple o Menú desplegable.
    *   **Opciones:** Competitivos/FPS, Estrategia/MOBA, Aventura/RPG.
*   **`feiss_marca_actual`:**
    *   **Tipo de campo:** Texto de una línea.

### 2.2. Uso de `manage_crm_objects` (Ejemplo de cómo Make lo usaría internamente)

Cuando Make ejecuta el módulo de HubSpot para crear/actualizar un contacto, internamente estaría haciendo una llamada similar a esta (simplificada para ilustrar el concepto):

```python
# Ejemplo conceptual de cómo Make usaría el MCP de HubSpot
# Esto no es código ejecutable directamente por el usuario, sino una representación
# de la llamada que Make haría al MCP.

contact_data = {
    "objectType": "contacts",
    "properties": [
        {"name": "email", "value": "{{webhook.email}}"},
        {"name": "firstname", "value": "{{webhook.first_name}}"},
        {"name": "lastname", "value": "{{webhook.last_name}}"},
        {"name": "phone", "value": "{{webhook.phone_number}}"},
        {"name": "feiss_periferico_interes", "value": "{{webhook.periferico_interes}}"},
        {"name": "feiss_tipo_juego", "value": "{{webhook.tipo_juego}}"},
        {"name": "feiss_marca_actual", "value": "{{webhook.marca_actual}}"}
    ]
}

# La llamada real a la herramienta MCP sería algo como:
# manus-mcp-cli tool call manage_crm_objects --server hubspot --input '<json_args>'
# donde json_args contendría la estructura de contact_data
```

**Explicación de `manage_crm_objects`:**

*   **`objectType`:** Especifica el tipo de objeto CRM que se va a manipular (en este caso, `contacts`).
*   **`properties`:** Es una lista de objetos, donde cada objeto representa una propiedad del contacto. Contiene el `name` de la propiedad de HubSpot y el `value` que se le asignará. En Make, estos valores se obtendrían dinámicamente del webhook (`{{webhook.campo}}`).

## 3. Configuración en Meta Ads Manager

1.  **Abrir el formulario de leads** en Meta Ads Manager.
2.  Ir a la sección de **"Configuración"** del formulario.
3.  En la sección de **"Webhooks"**, pegar la URL generada por el módulo de Webhook personalizado de Make.
4.  **Probar la integración:** Utiliza la herramienta de prueba de Meta para enviar un lead de prueba y verificar que los datos llegan correctamente a Make y se crean/actualizan en HubSpot.

## 4. Pruebas y Monitoreo

*   **Realizar pruebas exhaustivas** con diferentes escenarios (nuevos leads, leads existentes, datos incompletos) para asegurar que el flujo funciona como se espera.
*   **Monitorear el historial de ejecuciones en Make** para identificar y resolver cualquier error.
*   **Verificar los contactos en HubSpot** para confirmar que los datos se están mapeando correctamente y que los flujos de trabajo se están activando.

Con esta configuración, tendrás un sistema robusto y automatizado para captar y gestionar leads de periféricos gaming FEISS, permitiendo a tu equipo de ventas actuar rápidamente y de forma personalizada.
