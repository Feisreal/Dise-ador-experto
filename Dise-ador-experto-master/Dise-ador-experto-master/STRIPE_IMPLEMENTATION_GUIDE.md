# Guía de Implementación - Integración Mejorada de Stripe

**Versión:** 2.0  
**Fecha:** 31 de mayo de 2026  
**Estado:** Listo para implementación

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Requisitos Previos](#requisitos-previos)
3. [Paso 1: Configuración de Stripe](#paso-1-configuración-de-stripe)
4. [Paso 2: Configuración de Variables de Entorno](#paso-2-configuración-de-variables-de-entorno)
5. [Paso 3: Actualizar Código del Servidor](#paso-3-actualizar-código-del-servidor)
6. [Paso 4: Actualizar Frontend](#paso-4-actualizar-frontend)
7. [Paso 5: Configurar Webhooks](#paso-5-configurar-webhooks)
8. [Paso 6: Pruebas](#paso-6-pruebas)
9. [Paso 7: Deployment en Vercel](#paso-7-deployment-en-vercel)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen Ejecutivo

Este documento proporciona una guía completa para implementar la integración mejorada de Stripe en tu plataforma FEISS. Los cambios incluyen:

- ✅ Manejo completo de estados de PaymentIntent
- ✅ Soporte para autenticación 3D Secure
- ✅ Endpoint de confirmación de email
- ✅ CORS configurado correctamente
- ✅ Soporte para suscripciones
- ✅ Mejor manejo de errores
- ✅ Health check endpoint

---

## 📦 Requisitos Previos

### Herramientas Necesarias
- Node.js 14+ instalado
- Git configurado
- Acceso a Vercel
- Acceso a GitHub

### Cuentas Necesarias
- Cuenta Stripe activa (ya existe: formainc)
- Cuenta Vercel (ya existe)
- Cuenta Gmail con App Password (para emails)

### Archivos Proporcionados
1. `server_improved.js` - Servidor mejorado
2. `landing-stripe-improved.html` - Frontend mejorado
3. `STRIPE_INTEGRATION_ANALYSIS.md` - Análisis detallado
4. Este documento

---

## 🔑 Paso 1: Configuración de Stripe

### 1.1 Obtener Claves API

**Ya están configuradas en tu cuenta:**
- Account ID: `acct_1QL9GuKTUQBaToPz`
- Display Name: `formainc`

**Necesitas obtener:**

1. **Clave Pública (Publishable Key)**
   - Ir a: https://dashboard.stripe.com/apikeys
   - Copiar la clave que comienza con `pk_test_` o `pk_live_`
   - Guardar en variable `STRIPE_PUBLIC_KEY`

2. **Clave Secreta (Secret Key)**
   - Ir a: https://dashboard.stripe.com/apikeys
   - Copiar la clave que comienza con `sk_test_` o `sk_live_`
   - Guardar en variable `STRIPE_SECRET_KEY`

### 1.2 Crear Webhook Secret

1. Ir a: https://dashboard.stripe.com/webhooks
2. Hacer clic en "Add endpoint"
3. Configurar:
   - **URL:** `https://feispla.vercel.app/api/webhook/stripe`
   - **Eventos:** Seleccionar los siguientes:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

4. Copiar el **Signing secret** (comienza con `whsec_`)
5. Guardar en variable `STRIPE_WEBHOOK_SECRET`

### 1.3 Verificar Productos

Los productos ya existen en tu cuenta:
- Suscripción Semanal (prod_UKgpu7sED05kmq)
- Suscripción Mensual (prod_UKgmXb58yxxQgH)
- FEISPLA (prod_UIKoIHhQerm7RD)

---

## 🔐 Paso 2: Configuración de Variables de Entorno

### 2.1 En Desarrollo Local

Crear archivo `.env` en la raíz del proyecto:

```env
# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Email Configuration
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password

# Server Configuration
PORT=3001
NODE_ENV=development
DOMAIN=http://localhost:3000

# Database (si aplica)
DATABASE_URL=your_database_url_here
```

### 2.2 En Vercel (Producción)

1. Ir a: https://vercel.com/dashboard
2. Seleccionar proyecto `feispla`
3. Settings → Environment Variables
4. Agregar las siguientes variables:

| Variable | Valor |
|----------|-------|
| `STRIPE_PUBLIC_KEY` | `pk_test_...` o `pk_live_...` |
| `STRIPE_SECRET_KEY` | `sk_test_...` o `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `EMAIL_USER` | tu-email@gmail.com |
| `EMAIL_PASSWORD` | tu-app-password |
| `DOMAIN` | https://feispla.vercel.app |
| `NODE_ENV` | production |

### 2.3 Configurar Gmail App Password

Si aún no tienes App Password:

1. Ir a: https://myaccount.google.com/apppasswords
2. Seleccionar:
   - App: Mail
   - Device: Windows PC (o tu dispositivo)
3. Copiar la contraseña generada
4. Usar como `EMAIL_PASSWORD`

---

## 🚀 Paso 3: Actualizar Código del Servidor

### 3.1 Reemplazar server.js

1. Hacer backup del archivo actual:
   ```bash
   cp server.js server.js.backup
   ```

2. Reemplazar con `server_improved.js`:
   ```bash
   cp server_improved.js server.js
   ```

3. Instalar dependencias (si es necesario):
   ```bash
   npm install
   ```

### 3.2 Verificar Cambios Principales

El nuevo servidor incluye:

✅ **CORS mejorado:**
```javascript
const allowedOrigins = [
    'https://feispla.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
];
```

✅ **Manejo de 3D Secure:**
```javascript
if (paymentIntent.status === "requires_action") {
    return res.json({
        success: false,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret
    });
}
```

✅ **Endpoint de email:**
```javascript
app.post("/api/send-confirmation-email", async (req, res) => {
    // Implementación completa
});
```

✅ **Soporte para suscripciones:**
```javascript
app.post("/api/create-subscription", async (req, res) => {
    // Implementación completa
});
```

✅ **Health check:**
```javascript
app.get("/api/health", (req, res) => {
    // Verifica estado de configuración
});
```

---

## 🎨 Paso 4: Actualizar Frontend

### 4.1 Reemplazar landing-stripe.html

1. Hacer backup:
   ```bash
   cp landing-stripe.html landing-stripe.html.backup
   ```

2. Reemplazar con `landing-stripe-improved.html`:
   ```bash
   cp landing-stripe-improved.html landing-stripe.html
   ```

### 4.2 Cambios Principales

✅ **Configuración de clave pública mejorada:**
```javascript
const STRIPE_PUBLIC_KEY = window.STRIPE_PUBLIC_KEY || 'pk_test_YOUR_KEY';
```

✅ **Manejo de 3D Secure:**
```javascript
if (paymentData.requiresAction) {
    const { error: confirmError } = await stripe.confirmCardPayment(
        paymentData.clientSecret,
        { payment_method: paymentMethod.id }
    );
}
```

✅ **Mejor manejo de errores:**
```javascript
const displayError = document.getElementById('cardError');
displayError.textContent = error.message;
displayError.classList.add('show');
```

✅ **URL dinámica del servidor:**
```javascript
const serverUrl = window.location.origin === 'http://localhost:3000' 
    ? 'http://localhost:3001'
    : window.location.origin;
```

---

## 🔗 Paso 5: Configurar Webhooks

### 5.1 Crear Webhook en Stripe

1. Ir a: https://dashboard.stripe.com/webhooks
2. Hacer clic en "Add endpoint"
3. Configurar:

| Campo | Valor |
|-------|-------|
| URL | `https://feispla.vercel.app/api/webhook/stripe` |
| Events | Ver lista abajo |

### 5.2 Seleccionar Eventos

- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `charge.refunded`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### 5.3 Obtener Webhook Secret

1. Después de crear el endpoint, copiar el **Signing secret**
2. Guardar en variable de entorno `STRIPE_WEBHOOK_SECRET`

### 5.4 Pruebas Locales (Opcional)

Para probar webhooks localmente:

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Autenticarse
stripe login

# Escuchar eventos
stripe listen --forward-to localhost:3001/api/webhook/stripe

# Copiar webhook signing secret
# Usar en .env como STRIPE_WEBHOOK_SECRET
```

---

## 🧪 Paso 6: Pruebas

### 6.1 Pruebas Locales

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm run dev

# En otra terminal, iniciar frontend
npm run start

# Acceder a http://localhost:3000
```

### 6.2 Tarjetas de Prueba de Stripe

| Caso | Número | Vencimiento | CVC |
|------|--------|-------------|-----|
| Exitoso | 4242 4242 4242 4242 | 12/25 | 123 |
| Rechazado | 4000 0000 0000 0002 | 12/25 | 123 |
| 3D Secure | 4000 0025 0000 3155 | 12/25 | 123 |
| Insufficient Funds | 4000 0000 0000 9995 | 12/25 | 123 |

### 6.3 Verificar Health Check

```bash
curl http://localhost:3001/api/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-05-31T00:00:00.000Z",
  "environment": "development",
  "stripeConfigured": true,
  "webhookConfigured": true,
  "emailConfigured": true
}
```

### 6.4 Pruebas de Pago

1. Abrir http://localhost:3000
2. Hacer clic en "Comenzar Ahora" en un plan
3. Completar formulario:
   - Email: test@example.com
   - Nombre: Test User
   - Tarjeta: 4242 4242 4242 4242
4. Hacer clic en "Pagar"
5. Verificar:
   - ✅ Pago procesado
   - ✅ Email de confirmación recibido
   - ✅ Webhook recibido en Stripe

---

## 🌐 Paso 7: Deployment en Vercel

### 7.1 Preparar Cambios

```bash
# Agregar archivos modificados
git add server.js landing-stripe.html

# Hacer commit
git commit -m "feat: Mejorar integración de Stripe con 3D Secure y webhooks"

# Hacer push
git push origin main
```

### 7.2 Configurar Variables en Vercel

1. Ir a: https://vercel.com/dashboard
2. Seleccionar proyecto `feispla`
3. Settings → Environment Variables
4. Agregar todas las variables del Paso 2.2

### 7.3 Deploy

```bash
# Vercel se desplegará automáticamente al hacer push a main
# O manualmente:
vercel --prod
```

### 7.4 Verificar Deployment

1. Ir a: https://feispla.vercel.app/api/health
2. Verificar que todas las configuraciones están activas
3. Probar pago en producción

---

## 🔍 Troubleshooting

### Problema: "Invalid API Key"

**Causa:** Clave de Stripe incorrecta

**Solución:**
1. Verificar clave en https://dashboard.stripe.com/apikeys
2. Copiar clave correcta
3. Actualizar variable de entorno
4. Reiniciar servidor

### Problema: "Webhook signature verification failed"

**Causa:** Webhook secret incorrecto

**Solución:**
1. Ir a https://dashboard.stripe.com/webhooks
2. Copiar el signing secret correcto
3. Actualizar `STRIPE_WEBHOOK_SECRET`
4. Reiniciar servidor

### Problema: "CORS error"

**Causa:** Origen no permitido

**Solución:**
1. Verificar que el origen está en `allowedOrigins`
2. Agregar nuevo origen si es necesario
3. Reiniciar servidor

### Problema: "Email not sent"

**Causa:** Credenciales de Gmail incorrectas

**Solución:**
1. Verificar email en https://myaccount.google.com/apppasswords
2. Generar nuevo App Password
3. Actualizar `EMAIL_PASSWORD`
4. Reiniciar servidor

### Problema: "Payment failed silently"

**Causa:** No se maneja estado `requires_action`

**Solución:**
1. Verificar que se usa `server_improved.js`
2. Verificar que se usa `landing-stripe-improved.html`
3. Revisar logs del servidor

### Problema: "3D Secure no funciona"

**Causa:** Cliente no confirma el pago

**Solución:**
1. Usar tarjeta de prueba 3D Secure: 4000 0025 0000 3155
2. Verificar que se maneja `requiresAction` en frontend
3. Revisar logs del navegador (F12)

---

## 📊 Monitoreo

### Verificar Pagos en Stripe

1. Ir a: https://dashboard.stripe.com/payments
2. Ver todas las transacciones
3. Hacer clic en una para ver detalles

### Verificar Webhooks

1. Ir a: https://dashboard.stripe.com/webhooks
2. Hacer clic en el endpoint
3. Ver eventos recibidos

### Verificar Logs en Vercel

1. Ir a: https://vercel.com/dashboard
2. Seleccionar proyecto
3. Deployments → Logs

---

## ✅ Checklist Final

- [ ] Claves de Stripe obtenidas
- [ ] Webhook secret configurado
- [ ] Variables de entorno en `.env`
- [ ] Variables de entorno en Vercel
- [ ] `server.js` actualizado
- [ ] `landing-stripe.html` actualizado
- [ ] Webhook creado en Stripe
- [ ] Pruebas locales completadas
- [ ] Pruebas en producción completadas
- [ ] Emails de confirmación funcionando
- [ ] 3D Secure funcionando
- [ ] Documentación actualizada

---

## 📞 Soporte

Si encuentras problemas:

1. Revisar los logs del servidor
2. Consultar [Troubleshooting](#troubleshooting)
3. Revisar documentación de Stripe: https://stripe.com/docs
4. Contactar a: feispla@hotmail.com

---

**Última actualización:** 31 de mayo de 2026  
**Versión:** 2.0  
**Estado:** Listo para implementación
