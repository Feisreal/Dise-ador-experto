# Alternativas para la incrustación de videos y corrección de iconos

## 1. Reemplazo de iframes de HeyGen

El problema con los iframes de HeyGen (`app.heygen.com/embed`) es la política de seguridad `Content-Security-Policy: frame-ancestors` que restringe su incrustación a dominios específicos. Dado que `localhost` y el dominio final de FEISS no están en esa lista, los videos no se cargan, resultando en cuadros blancos.

Se proponen las siguientes alternativas:

### Opción A: Incrustar videos de YouTube o Vimeo

Esta es la solución más común y robusta para incrustar videos. Requiere que los videos se suban a YouTube o Vimeo. Estas plataformas tienen políticas de incrustación más permisivas y sus iframes funcionan en la mayoría de los entornos.

**Ventajas:**
*   Amplia compatibilidad y rendimiento optimizado.
*   Fácil de implementar con los códigos de incrustación proporcionados por las plataformas.
*   Funcionalidades adicionales como controles de reproducción, calidad adaptable, etc.

**Desventajas:**
*   Requiere subir los videos a una plataforma externa.
*   Puede mostrar la marca de la plataforma (YouTube/Vimeo).

**Ejemplo de implementación (YouTube):**

Para reemplazar el primer iframe de HeyGen (Resumen de Auditoría) en `public/index.html` (líneas 1179-1185), se podría usar un iframe de YouTube. Primero, se debería subir el video a YouTube y obtener su ID (ej. `VIDEO_ID_RESUMEN`).

```html
<!-- Video 1: Resumen de Auditoría (reemplazo con YouTube) -->
<div style="background: #f9fafb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
        <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
            src="https://www.youtube.com/embed/VIDEO_ID_RESUMEN" 
            title="Informe de Auditoría FEISS - Éxito Mundial en Shopify" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    </div>
    <div style="padding: 1.5rem; background: white;">
        <h3 style="color: var(--primary); margin-bottom: 0.5rem; font-size: 1.2rem;">Resumen de Auditoría</h3>
        <p style="color: var(--text-light); font-size: 0.95rem;">Análisis completo del repositorio FEISS Knowledge y recomendaciones clave para el éxito mundial en Shopify.</p>
    </div>
</div>
```

Se aplicaría un cambio similar para el segundo video (`5 Recomendaciones Clave`).

### Opción B: Miniatura con enlace a HeyGen

Esta opción evita completamente el problema de incrustación al no usar un `iframe`. En su lugar, se muestra una imagen en miniatura (o un placeholder) que, al hacer clic, redirige al usuario a la página original del video en HeyGen.

**Ventajas:**
*   Muy fácil de implementar.
*   Garantiza que el video siempre será accesible, ya que se abre directamente en la plataforma de HeyGen.
*   Evita cualquier problema de seguridad o compatibilidad con iframes.

**Desventajas:**
*   El usuario abandona la página actual para ver el video.
*   Experiencia menos integrada.

**Ejemplo de implementación:**

Para reemplazar el primer iframe de HeyGen, se podría usar una miniatura. Se necesitaría una imagen de miniatura (`thumbnail_resumen.jpg`) del video.

```html
<!-- Video 1: Resumen de Auditoría (reemplazo con miniatura y enlace) -->
<div style="background: #f9fafb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <a href="https://app.heygen.com/embed/ffb2300d99a4426ea51c47dc2217347d" target="_blank" style="display: block; text-decoration: none;">
        <img src="/public/assets/images/thumbnail_resumen.jpg" alt="Miniatura del video Resumen de Auditoría" style="width: 100%; height: auto; display: block;">
        <div style="padding: 1.5rem; background: white;">
            <h3 style="color: var(--primary); margin-bottom: 0.5rem; font-size: 1.2rem;">Resumen de Auditoría</h3>
            <p style="color: var(--text-light); font-size: 0.95rem;">Análisis completo del repositorio FEISS Knowledge y recomendaciones clave para el éxito mundial en Shopify.</p>
        </div>
    </a>
</div>
```

Se necesitaría crear las miniaturas y guardarlas en una ruta accesible, por ejemplo, `/public/assets/images/`.

## 2. Corrección del icono `fa-presentation`

El icono `fa-presentation` no se renderiza correctamente, lo que sugiere que la clase no existe en la versión de Font Awesome que se está utilizando o no está disponible en el paquete cargado. Se recomienda reemplazarlo por una clase de icono válida y semánticamente similar.

**Ejemplo de implementación:**

Reemplazar en todos los archivos HTML donde aparezca:

```html
<i class="fas fa-presentation"></i>
```

Por ejemplo, con `fa-chalkboard-user` (pizarra de usuario) o `fa-file-powerpoint` (archivo PowerPoint):

```html
<i class="fas fa-chalkboard-user"></i>
```

O

```html
<i class="fas fa-file-powerpoint"></i>
```

Esta corrección debe aplicarse en `public/index.html`, `index.html`, `landing.html`, `landing-stripe.html` y sus copias en `public/`.

## Próximo paso

Por favor, indica qué opción prefieres para los videos (Opción A o B) y qué icono te gustaría usar para la 
