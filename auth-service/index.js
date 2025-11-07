require('dotenv').config();
const express = require('express');
const helmet = require('helmet'); // Para seguridad básica
const cors = require('cors'); // Para permitir peticiones de otros orígenes
const morgan = require('morgan'); // Para logging de peticiones
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de seguridad y logging
app.use(helmet());
app.use(cors());
app.use(morgan('dev')); // 'dev' para logs concisos en desarrollo

// Middleware para parsear JSON en el body de las peticiones
app.use(express.json());

// Rutas del servicio de autenticación
app.use('/api/auth', authRoutes);

// Manejador de errores global para cualquier error no capturado
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!', error: err.message });
});

app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});