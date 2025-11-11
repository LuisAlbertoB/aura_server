const rateLimit = require('express-rate-limit');

// Rate limiting general para todas las rutas
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requests por ventana de tiempo
  message: {
    success: false,
    message: 'Demasiadas solicitudes, intenta de nuevo en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Saltar rate limiting para health check
    return req.path === '/health';
  }
});

// Rate limiting estricto para crear publicaciones
const createPublicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // Máximo 20 publicaciones por hora
  message: {
    success: false,
    message: 'Has alcanzado el límite de publicaciones por hora. Intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para likes (más permisivo)
const likeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 50, // Máximo 50 likes en 5 minutos
  message: {
    success: false,
    message: 'Demasiados likes en poco tiempo. Espera 5 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para comentarios
const commentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 30, // Máximo 30 comentarios en 10 minutos
  message: {
    success: false,
    message: 'Demasiados comentarios en poco tiempo. Espera 10 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para acciones sociales (agregar amigos, bloquear)
const socialActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // Máximo 10 acciones sociales por hora
  message: {
    success: false,
    message: 'Demasiadas acciones sociales en poco tiempo. Espera una hora.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para búsquedas
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // Máximo 20 búsquedas por minuto
  message: {
    success: false,
    message: 'Demasiadas búsquedas. Espera un minuto.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  createPublicationLimiter,
  likeLimiter,
  commentLimiter,
  socialActionLimiter,
  searchLimiter
};