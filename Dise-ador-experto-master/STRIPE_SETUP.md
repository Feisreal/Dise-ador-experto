# Guía de Configuración de Stripe - FEISS Landing Page

## 📋 Requisitos Previos

- Node.js 14+ instalado
- Cuenta de Stripe (crear en https://stripe.com)
- Gmail configurado para enviar emails (opcional)

---

## 🔑 Paso 1: Obtener Claves de Stripe

### 1.1 Crear Cuenta en Stripe
1. Ir a https://stripe.com
2. Hacer clic en "Sign up"
3. Completar el formulario de registro
4. Verificar email

### 1.2 Obtener Claves API
1. Ir a Dashboard → Developers → API Keys
2. Copiar **Publishable key** (comienza con `pk_test_`)
3. Copiar **Secret key** (comienza con `sk_test_`)

### 1.3 Configurar Webhook
1. Ir a Dashboard → Developers → Webhooks
2. Hacer clic en "Add endpoint"
3. URL del endpoint: `https://tudominio.com/api/webhook/stripe`
4. Seleccionar eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copiar **Signing secret** (comienza con `whsec_`)

---

## 🚀 Paso 2: Configurar Variables de Entorno

### 2.1 Crear archivo .env
```bash
cp .env.example .env
```

### 2.2 Editar .env con tus claves
```env
# Stripe
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# Email (Gmail)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password

# Server
PORT=3001
NODE_ENV=development
```

### 2.3 Configurar Gmail (opcional)
1. Habilitar 2FA en tu cuenta de Google
2. Crear "App Password" en https://myaccount.google.com/apppasswords
3. Usar la contraseña generada en `EMAIL_PASSWORD`

---

## 📦 Paso 3: Instalar Dependencias

```bash
npm install
```

Esto instalará:
- express (servidor web)
- stripe (SDK de Stripe)
- cors (CORS middleware)
- body-parser (parseo de JSON)
- nodemailer (envío de emails)
- dotenv (variables de entorno)

---

## 🏃 Paso 4: Ejecutar el Servidor

### Modo Desarrollo
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

El servidor estará disponible en `http://localhost:3001`

---

## 🧪 Paso 5: Pruebas con Tarjetas de Prueba

Stripe proporciona tarjetas de prueba para desarrollo:

### Tarjeta Exitosa
- Número: `4242 4242 4242 4242`
- Vencimiento: `12/25`
- CVC: `123`

### Tarjeta Rechazada
- Número: `4000 0000 0000 0002`
- Vencimiento: `12/25`
- CVC: `123`

### Tarjeta Requiere Autenticación
- Número: `4000 0025 0000 3155`
- Vencimiento: `12/25`
- CVC: `123`

---

## 📝 Paso 6: Actualizar Landing Page

### 6.1 Reemplazar clave pública en HTML
En `index-stripe.html`, buscar:
```javascript
const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_STRIPE_PUBLIC_KEY_HERE';
```

Reemplazar con tu clave pública:
```javascript
const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_ACTUAL_KEY_HERE';
```

### 6.2 Configurar URL del servidor
En `index-stripe.html`, buscar:
```javascript
const response = await fetch('/api/create-payment-intent', {
```

Si el servidor está en otro puerto/dominio:
```javascript
const response = await fetch('http://localhost:3001/api/create-payment-intent', {
```

---

## 🔄 Paso 7: Flujo de Pago

### Cliente
1. Usuario hace clic en "Comprar Ahora"
2. Se abre modal de checkout
3. Ingresa email, nombre y datos de tarjeta
4. Hace clic en "Pagar"

### Frontend
1. JavaScript crea `PaymentMethod` con Stripe
2. Envía al backend con datos del cliente

### Backend
1. Recibe `PaymentMethod` y datos
2. Crea `PaymentIntent` con Stripe
3. Confirma el pago
4. Guarda orden en base de datos
5. Envía email de confirmación
6. Retorna token de acceso

### Cliente
1. Recibe confirmación
2. Acceso activado
3. Email recibido

---

## 🛡️ Seguridad

### Mejores Prácticas Implementadas
- ✅ Claves de API en variables de entorno
- ✅ Validación de datos en servidor
- ✅ HTTPS recomendado en producción
- ✅ Webhook signature verification
- ✅ Manejo de errores seguro

### Recomendaciones Adicionales
1. **HTTPS**: Usar SSL/TLS en producción
2. **Rate Limiting**: Implementar límite de requests
3. **Logging**: Registrar todas las transacciones
4. **Backup**: Hacer backup de órdenes regularmente
5. **PCI Compliance**: Cumplir con estándares PCI DSS

---

## 📊 Monitoreo

### Ver Pagos en Stripe Dashboard
1. Ir a Dashboard → Payments
2. Ver todas las transacciones
3. Descargar reportes

### Ver Eventos en Webhook
1. Ir a Dashboard → Developers → Webhooks
2. Hacer clic en endpoint
3. Ver eventos recibidos

---

## 🐛 Solución de Problemas

### Error: "Invalid API Key"
- Verificar que `STRIPE_SECRET_KEY` sea correcto
- Asegurar que sea clave de prueba (comienza con `sk_test_`)

### Error: "Webhook signature verification failed"
- Verificar que `STRIPE_WEBHOOK_SECRET` sea correcto
- Regenerar webhook secret si es necesario

### Error: "Email not sent"
- Verificar credenciales de Gmail
- Habilitar "Less secure apps" o usar App Password
- Revisar logs del servidor

### Error: "CORS error"
- Verificar que CORS esté habilitado en servidor
- Agregar dominio a lista de orígenes permitidos

---

## 📚 Recursos Útiles

- [Documentación de Stripe](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Webhook Documentation](https://stripe.com/docs/webhooks)

---

## 🚀 Deployment

### Heroku
```bash
# Crear app
heroku create feiss-payment-server

# Configurar variables
heroku config:set STRIPE_SECRET_KEY=sk_test_...
heroku config:set STRIPE_PUBLIC_KEY=pk_test_...

# Deploy
git push heroku main
```

### AWS Lambda
1. Crear función Lambda con Node.js
2. Configurar variables de entorno
3. Usar API Gateway para HTTP
4. Configurar webhook en Stripe

### DigitalOcean
1. Crear droplet con Node.js
2. Clonar repositorio
3. Instalar dependencias
4. Configurar PM2 para auto-restart
5. Configurar Nginx como reverse proxy

---

## 📞 Soporte

Para ayuda:
- Email: feispla@hotmail.com
- Documentación: https://feiss.dev/docs
- Chat: https://chat.feiss.dev

---

**Última actualización:** 21 de mayo de 2026  
**Versión:** 1.0.0
