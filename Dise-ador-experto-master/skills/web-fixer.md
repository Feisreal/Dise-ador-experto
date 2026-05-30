---
name: web-fixer
description: Diagnostica y corrige problemas comunes de visualización en aplicaciones web (cuadros en blanco, iconos faltantes, iframes bloqueados) en repositorios locales. Utiliza esta habilidad cuando el usuario reporte errores visuales en una web o necesite reemplazar contenido bloqueado.
license: Complete terms in LICENSE.txt
---

# Web Fixer Skill

Esta habilidad permite diagnosticar y solucionar problemas de visualización en proyectos web alojados en repositorios locales. Se enfoca en la identificación y corrección de elementos como cuadros en blanco, iconos faltantes y iframes bloqueados, proporcionando soluciones prácticas y la implementación de las mismas.

## Flujo de Trabajo

El proceso de esta habilidad sigue los siguientes pasos:

1.  **Clonar y Explorar el Repositorio:**
    *   Clona el repositorio del usuario y explora su estructura para identificar archivos HTML, CSS y JavaScript relevantes.
    *   Levanta un servidor local (si es necesario) para visualizar la aplicación web.

2.  **Diagnóstico Visual y Técnico:**
    *   Navega por la aplicación web en el navegador para identificar visualmente los "cuadros en blanco" o elementos faltantes.
    *   Utiliza las herramientas de desarrollo del navegador (consola, inspector de elementos) para identificar errores de carga, bloqueos de contenido (ej. `frame-ancestors`), o clases CSS incorrectas.
    *   Realiza búsquedas en el código fuente (`grep`) para localizar las referencias a los elementos problemáticos (ej. URLs de iframes, clases de iconos).

3.  **Propuesta de Soluciones:**
    *   Basado en el diagnóstico, propone alternativas al usuario (ej. reemplazar iframes bloqueados por videos de YouTube, corregir clases de iconos).
    *   En caso de iframes bloqueados, ofrece opciones como incrustar videos de plataformas más permisivas (YouTube, Vimeo) o usar miniaturas con enlaces.
    *   En caso de iconos faltantes, sugiere clases de iconos válidas de la misma librería (ej. Font Awesome).

4.  **Implementación de la Solución:**
    *   Una vez que el usuario aprueba una solución, implementa los cambios directamente en los archivos del repositorio.
    *   Para el reemplazo de iframes, utiliza scripts de Python o comandos `sed` para modificar las URLs de incrustación.
    *   Para la corrección de iconos, modifica las clases CSS en los archivos HTML relevantes.

5.  **Verificación y Entrega:**
    *   Verifica que los cambios se hayan aplicado correctamente recargando la aplicación web localmente y confirmando la visualización.
    *   Realiza un `git commit` y `git push` de los cambios al repositorio del usuario.
    *   Genera un informe detallado de los cambios realizados, incluyendo el diagnóstico, las soluciones y los archivos afectados.

## Recursos Incluidos

*   `scripts/`: Puede incluir scripts de Python para automatizar la modificación de archivos HTML (ej. `update_iframes.py`).
*   `references/`: Documentación sobre políticas de seguridad web (`frame-ancestors`), librerías de iconos (Font Awesome) o guías de incrustación de videos.

## Uso de la Habilidad

Para utilizar esta habilidad, el usuario debe proporcionar acceso al repositorio web y describir el problema visual que está experimentando. La habilidad guiará al usuario a través del proceso de diagnóstico, propuesta de soluciones e implementación.
