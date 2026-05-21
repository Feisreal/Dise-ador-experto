# Ejemplos de Código Específicos para Shopify

Esta sección proporciona ejemplos de código prácticos para interactuar con el ecosistema de Shopify, centrándose en la Storefront API (GraphQL) y Liquid.

## 1. Ejemplo de Consulta GraphQL a la Storefront API (React/JavaScript)

Este ejemplo muestra cómo obtener una lista de productos de una colección específica utilizando la Storefront API de Shopify con GraphQL en un entorno React.

```javascript
// src/components/ProductList.js
import React, { useEffect, useState } from 'react';

const SHOPIFY_STORE_DOMAIN = 'YOUR_SHOPIFY_STORE_DOMAIN.myshopify.com';
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'YOUR_SHOPIFY_STOREFRONT_ACCESS_TOKEN';

const ProductList = ({ collectionHandle }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const query = `
        query getCollectionProducts($handle: String!) {
          collectionByHandle(handle: $handle) {
            products(first: 10) {
              edges {
                node {
                  id
                  title
                  handle
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  images(first: 1) {
                    edges {
                      node {
                        url
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      try {
        const response = await fetch(`https://${SHOPIFY_STORE_DOMAIN}/api/2023-07/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
          },
          body: JSON.stringify({
            query,
            variables: { handle: collectionHandle },
          }),
        });

        const data = await response.json();

        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        setProducts(data.data.collectionByHandle.products.edges.map(edge => edge.node));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [collectionHandle]);

  if (loading) return <p>Cargando productos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map(product => (
        <div key={product.id} className="border p-4 rounded-lg shadow-md">
          <img src={product.images.edges[0]?.node.url} alt={product.images.edges[0]?.node.altText} className="w-full h-48 object-cover mb-4" />
          <h3 className="text-lg font-bold">{product.title}</h3>
          <p className="text-gray-700">{product.priceRange.minVariantPrice.amount} {product.priceRange.minVariantPrice.currencyCode}</p>
          <a href={`/products/${product.handle}`} className="text-blue-500 hover:underline">Ver Producto</a>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
```

## 2. Ejemplo de Snippet Liquid para un Tema de Shopify

Este ejemplo muestra cómo crear un snippet Liquid para mostrar un mensaje de bienvenida personalizado basado en si el usuario ha iniciado sesión o no.

```liquid
{# snippets/welcome-message.liquid #}

{% if customer %}
  <p>¡Bienvenido de nuevo, {{ customer.first_name }}!</p>
{% else %}
  <p>¡Bienvenido a nuestra tienda! <a href="/account/login">Inicia sesión</a> o <a href="/account/register">regístrate</a>.</p>
{% endif %}

<style>
  .welcome-message {
    padding: 10px;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    text-align: center;
    margin-bottom: 20px;
  }
  .welcome-message a {
    color: #007bff;
    text-decoration: none;
  }
  .welcome-message a:hover {
    text-decoration: underline;
  }
</style>
```

Para usar este snippet en tu tema de Shopify, lo incluirías en un archivo de plantilla (por ejemplo, `sections/header.liquid` o `templates/index.liquid`) de la siguiente manera:

```liquid
{% include 'welcome-message' %}
```

## 3. Ejemplo de Webhook de Shopify (Node.js/Express)

Este es un ejemplo básico de cómo configurar un endpoint para recibir webhooks de Shopify en un servidor Node.js con Express. Este webhook escuchará el evento `orders/create`.

```javascript
// server.js (ejemplo simplificado)
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const SHOPIFY_WEBHOOK_SECRET = 'YOUR_SHOPIFY_WEBHOOK_SECRET'; // Obtenido desde el panel de Shopify

// Middleware para verificar la firma del webhook
const verifyWebhook = (req, res, next) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = req.rawBody; // Requiere body-parser para rawBody
  const digest = crypto.createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
                       .update(body)
                       .digest('base64');

  if (digest === hmac) {
    next();
  } else {
    console.log('Webhook signature verification failed.');
    res.status(401).send('Not Authorized');
  }
};

// Usar body-parser para obtener el raw body antes de JSON para la verificación del webhook
app.use(bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

app.post('/shopify/webhooks/orders/create', verifyWebhook, (req, res) => {
  console.log('Webhook de Shopify recibido: orders/create');
  const order = req.body;

  // Aquí puedes procesar la orden:
  // - Guardar en tu base de datos
  // - Enviar notificaciones
  // - Actualizar sistemas de inventario/CRM
  console.log('Nueva orden:', order.id);
  console.log('Cliente:', order.customer.email);
  console.log('Total:', order.total_price);

  res.status(200).send('Webhook recibido y procesado');
});

app.listen(PORT, () => {
  console.log(`Servidor de webhooks escuchando en el puerto ${PORT}`);
});
```

**Nota:** Para que este ejemplo funcione, necesitarás instalar `express` y `body-parser` (`npm install express body-parser crypto`). Además, el `SHOPIFY_WEBHOOK_SECRET` debe configurarse en el panel de administración de Shopify al crear el webhook.
