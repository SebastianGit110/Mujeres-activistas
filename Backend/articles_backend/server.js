const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas
app.use('/api/articles', require('./routers/articleRoutes'));
app.use('/api/comments', require('./routers/commentRoutes'));


// Para cuando implementes autenticación:
// app.use('/api/users', require('./routes/userRoutes'));

// Ruta para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
});