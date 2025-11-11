const jwt = require('jsonwebtoken');

//  ️ MIDDLEWARE DE VALIDACIÓN JWT - SOLO VALIDA TOKENS DEL SERVICIO DE AUTH EXTERNO
// NO genera tokens, solo verifica que los JWT recibidos sean válidos y auténticos
const authMiddleware = (req, res, next) => {
  try {
    console.log(' ️ Validando JWT del servicio de autenticación...');
    
    // 1. OBTENER TOKEN DEL HEADER
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de autorización requerido',
        code: 'NO_TOKEN'
      });
    }

    // 2. VERIFICAR FORMATO BEARER
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Use: Bearer <token>',
        code: 'INVALID_FORMAT'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token || token.trim() === '') {
      return res.status(401).json({
        success: false,
        message: 'Token vacío',
        code: 'EMPTY_TOKEN'
      });
    }

    // 3. VALIDAR JWT - VERIFICAR QUE SEA AUTÉNTICO
    // Usar el mismo JWT_SECRET que usa tu servicio de autenticación
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-here-make-it-long-and-complex');
    
    console.log('✅ Token JWT válido y verificado');
    console.log('👤 Datos del token:', {
      userId: decoded.id || decoded.userId || decoded.sub,
      email: decoded.email,
      role: decoded.role,
      exp: decoded.exp ? new Date(decoded.exp * 1000) : 'Sin expiración'
    });

    // 4. AGREGAR INFORMACIÓN DEL USUARIO AL REQUEST
    req.user = {
      id: decoded.id || decoded.userId || decoded.sub,
      email: decoded.email,
      role: decoded.role || 'user',
      username: decoded.username,
      permissions: decoded.permissions || [],
      isValidated: true,
      tokenExpiration: decoded.exp ? new Date(decoded.exp * 1000) : null,
      originalToken: token
    };

    console.log('✅ Usuario autenticado:', req.user.id, `(${req.user.email})`);
    next();

  } catch (error) {
    console.error('❌ Error validando JWT:', error.message);
    
    // Diferentes tipos de errores JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token JWT inválido o malformado',
        code: 'INVALID_JWT'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token JWT expirado',
        code: 'EXPIRED_JWT'
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        message: 'Token JWT no válido aún',
        code: 'JWT_NOT_ACTIVE'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno validando token',
      code: 'JWT_VALIDATION_ERROR'
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

// 🔓 MIDDLEWARE OPCIONAL - Para rutas públicas que pueden funcionar con o sin token
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      if (token && token.trim() !== '') {
        try {
          // Intentar validar el JWT (opcional, si falla continúa sin usuario)
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-here-make-it-long-and-complex');
          
          req.user = {
            id: decoded.id || decoded.userId || decoded.sub,
            email: decoded.email,
            role: decoded.role || 'user',
            username: decoded.username,
            isValidated: true,
            isOptional: true,
            originalToken: token
          };
          
          console.log('👤 Usuario opcional autenticado:', req.user.id);
        } catch (jwtError) {
          // Token inválido en modo opcional - continuar sin usuario
          console.log('⚠️ Token opcional inválido, continuando sin usuario');
          req.user = null;
        }
      }
    } else {
      // Sin token - acceso público permitido
      req.user = null;
      console.log('👤 Acceso público sin token');
    }
    
    next();
  } catch (error) {
    // Error en validación opcional - continuar sin usuario
    req.user = null;
    next();
  }
};

module.exports = {
  authMiddleware,
  requireRole,
  optionalAuth
};