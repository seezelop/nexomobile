// backend/server.js
require('dotenv').config(); // Cargar variables de entorno desde .env
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ruta para crear una preferencia de pago
app.post('/crear-preferencia', async (req, res) => {
  const { items } = req.body; // Recibir items desde el frontend

  const preference = {
    items: items, // Aquí se incluyen los productos para la preferencia
    back_urls: {
      success: 'http://localhost:3000/padre', // URL de éxito
      failure: 'http://localhost:3000/pago-fallido', // URL de fallo
    },
    auto_return: 'approved',
  };

  try {
    const response = await axios.post('https://api.mercadopago.com/checkout/preferences', preference, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
    });

    // Retornar el ID de la preferencia de pago
    res.json({ preferenceId: response.data.id });
  } catch (error) {
    console.error('Error al crear la preferencia:', error);
    res.status(500).send('Error al crear la preferencia');
  }
});

// Rutas de éxito y fracaso del pago
app.get('/padre', (req, res) => {
  const importe = req.query.importe; // Debería ser un número
  const usuarioId = req.query.usuarioId; // Debería ser el id del usuario

  console.log(`Importe recibido: ${importe}`);
  console.log(`Usuario ID recibido: ${usuarioId}`);
  console.log('infoo '+res)

})

app.get('/pago-fallido', (req, res) => {
  res.send('Hubo un error con el pago');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
