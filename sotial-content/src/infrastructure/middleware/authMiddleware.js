const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar formato Bearer token
    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido'
      });
    }

    // 🧪 MODO DESARROLLO: Permitir tokens de prueba
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      // Verificar si es un token de prueba
      if (token.includes('TEST_TOKEN') || token.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.TEST_TOKEN')) {
        console.log('🧪 Usando token de prueba para desarrollo');
        req.user = {
          id: 'test-user-123',
          email: 'test@example.com',
          role: 'user',
          isTestUser: true
        };
        return next();
      }
    }

    // Verificar el token real JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Agregar información del usuario al request
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user',
      isTestUser: false
    };

    next();

  } catch (error) {
    console.error('Error en autenticación:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error en la autenticación'
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permisos insuficientes'
      });
    }

    next();
  };
};

// Middleware opcional de autenticación (para rutas públicas con info adicional si está logueado)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        // 🧪 MODO DESARROLLO: Permitir tokens de prueba
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          if (token.includes('TEST_TOKEN') || token.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.TEST_TOKEN')) {
            req.user = {
              id: 'test-user-123',
              email: 'test@example.com',
              role: 'user',
              isTestUser: true
            };
            return next();
          }
        }
        
        // Token JWT real
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = {
          id: decoded.id || decoded.userId,
          email: decoded.email,
          role: decoded.role || 'user',
          isTestUser: false
        };
      }
    }
    
    next();
  } catch (error) {
    // Si hay error en el token opcional, continúa sin usuario
    next();
  }
};

module.exports = {
  authMiddleware,
  requireRole,
  optionalAuth
};