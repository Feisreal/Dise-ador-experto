---
name: web-optimizer
description: Optimiza el rendimiento de aplicaciones web en repositorios locales. Utiliza esta habilidad para mejorar la velocidad de carga, optimizar recursos y cumplir con las métricas de Core Web Vitals.
license: Complete terms in LICENSE.txt
---

# Web Optimizer Skill

Esta habilidad está diseñada para analizar, diagnosticar e implementar mejoras de rendimiento en aplicaciones web alojadas en repositorios locales. Su objetivo es optimizar la velocidad de carga, reducir el consumo de recursos y asegurar el cumplimiento de las mejores prácticas de rendimiento web, incluyendo las métricas de Core Web Vitals.

## Flujo de Trabajo

El proceso de optimización se estructura en los siguientes pasos:

1.  **Análisis Inicial y Diagnóstico:**
    *   **Evaluación:** Utiliza herramientas como Lighthouse (a través de la CLI o navegador) o PageSpeed Insights (simulado) para obtener un informe detallado del rendimiento actual de la web.
    *   **Identificación de Cuellos de Botella:** Analiza los resultados para identificar los principales problemas que afectan la velocidad de carga, como imágenes no optimizadas, JavaScript/CSS bloqueante, renderizado lento, etc.

2.  **Optimización de Recursos:**
    *   **Imágenes:**
        *   Identifica imágenes de gran tamaño o formatos ineficientes.
        *   Propone la conversión a formatos modernos (WebP, AVIF) y la compresión sin pérdida de calidad.
        *   Implementa la carga diferida (lazy loading) para imágenes fuera de la vista inicial.
    *   **CSS y JavaScript:**
        *   Minifica y comprime archivos CSS y JavaScript para reducir su tamaño.
        *   Elimina CSS no utilizado (PurgeCSS) y difiere la carga de scripts no críticos.
        *   Combina archivos CSS/JS cuando sea apropiado para reducir solicitudes HTTP.

3.  **Optimización de la Entrega y Carga:**
    *   **Caché del Navegador:** Configura cabeceras de caché adecuadas para recursos estáticos.
    *   **Preconexión y Precarga:** Sugiere la precarga de recursos críticos y la preconexión a orígenes de terceros.
    *   **Renderizado Crítico:** Prioriza la carga del contenido visible (Above-the-Fold) para mejorar el Largest Contentful Paint (LCP).

4.  **Optimización del Servidor (cuando sea aplicable):**
    *   Recomienda el uso de compresión GZIP/Brotli para la transferencia de datos.
    *   Sugiere la implementación de Content Delivery Networks (CDNs) para servir recursos estáticos.

5.  **Verificación y Reporte:**
    *   Vuelve a ejecutar las herramientas de análisis (Lighthouse, PageSpeed Insights) para verificar las mejoras de rendimiento.
    *   Genera un informe detallado con los cambios implementados, las métricas de rendimiento antes y después, y recomendaciones adicionales.
    *   Realiza un `git commit` y `git push` de los cambios al repositorio del usuario.

## Recursos Incluidos

*   `scripts/`: Puede incluir scripts de Python o Bash para automatizar tareas como:
    *   `optimize_images.py`: Compresión y conversión de imágenes.
    *   `minify_css_js.py`: Minificación de archivos CSS y JavaScript.
*   `references/`: Documentación sobre:
    *   Core Web Vitals (LCP, FID, CLS).
    *   Guías de optimización de imágenes y formatos modernos.
    *   Mejores prácticas de carga de CSS y JavaScript.

## Uso de la Habilidad

Para utilizar esta habilidad, el usuario debe proporcionar acceso al repositorio web y especificar las áreas de rendimiento que desea mejorar. La habilidad guiará al usuario a través del proceso de análisis, implementación y verificación de las optimizaciones.
