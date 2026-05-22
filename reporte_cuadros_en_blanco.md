# Reporte: cuadros en blanco en la web

## Resumen ejecutivo

Revisé el repositorio `Feisreal/feiss-knowledge`, levanté la web localmente en `http://localhost:3000/` y confirmé que los cuadros en blanco aparecen en la sección **“Auditoría de Expertos en Video”**. No se trata de tarjetas vacías generadas por CSS: las tarjetas sí se renderizan, pero la zona superior contiene dos `iframe` externos de HeyGen que no cargan correctamente dentro de la página.

| Ubicación visible | Archivo | Líneas | Elemento afectado |
|---|---:|---:|---|
| `Auditoría de Expertos en Video` → `Resumen de Auditoría` | `public/index.html` | 1179-1185 | `iframe` HeyGen |
| `Auditoría de Expertos en Video` → `5 Recomendaciones Clave` | `public/index.html` | 1196-1202 | `iframe` HeyGen |
| `¿Qué Incluye?` → `Presentación Profesional` | `public/index.html`, `index.html`, `landing.html`, `landing-stripe.html` y copias en `public/` | varias | icono `fa-presentation` no visible |

## Evidencia visual

En la sección **“Auditoría de Expertos en Video”** se observan dos recuadros grandes de color gris/blanco con un icono de archivo roto. Estos recuadros corresponden a los iframes:

```html
src="https://app.heygen.com/embed/ffb2300d99a4426ea51c47dc2217347d"
src="https://app.heygen.com/embed/c1f97a31dbff4645907bf3f7e491285b"
```

## Causa técnica probable

Las URLs de HeyGen responden con estado HTTP `200`, pero sus cabeceras incluyen una política de seguridad que restringe dónde pueden ser incrustadas:

```text
content-security-policy: frame-ancestors 'self' www.heygen.com labs.heygen.com app.datadoghq.com us.posthog.com;
```

Esa directiva **no incluye el dominio de la web FEISS ni `localhost`**, por lo que el navegador puede bloquear el renderizado dentro del `iframe`. El resultado visible es el cuadro vacío o roto en la tarjeta de video.

## Segundo detalle detectado

También hay un icono ausente en la tarjeta **“Presentación Profesional”** porque se usa la clase:

```html
<i class="fas fa-presentation"></i>
```

En Font Awesome 6.4.0 esa clase puede no existir o no estar disponible en el paquete cargado por CDN. Por eso se ve un bloque naranja sin icono dentro.

## Recomendaciones

Para los videos, la solución más estable es **no depender de `app.heygen.com/embed` si HeyGen no permite incrustar en el dominio final**. Hay tres opciones razonables:

| Opción | Ventaja | Desventaja |
|---|---|---|
| Publicar los videos en YouTube/Vimeo y usar sus iframes | Embed estable y compatible | Requiere subir los videos a otra plataforma |
| Usar enlaces/botones hacia HeyGen en lugar de iframes | Solución rápida, evita cuadros rotos | El video se abre fuera de la página |
| Configurar en HeyGen el dominio permitido para embed, si el servicio lo permite | Mantiene el diseño actual | Depende de la configuración/capacidades de HeyGen |

Para el icono de presentación, basta reemplazar `fa-presentation` por una clase válida, por ejemplo:

```html
<i class="fas fa-chalkboard-user"></i>
```

También podría usarse `fa-desktop`, `fa-file-powerpoint` o `fa-chart-simple`, según el estilo visual deseado.

## Próximo paso sugerido

Si quieres que lo corrija directamente en el repositorio, recomiendo aplicar dos cambios: reemplazar los iframes por tarjetas con botón **“Ver video”** mientras no haya un proveedor de video embebible, y corregir la clase `fa-presentation` en todos los HTML duplicados.
