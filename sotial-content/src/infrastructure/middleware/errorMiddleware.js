const errorHandler = (err, req, res, next) => {
  console.error('Error capturado:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Error de validación en base de datos',
      errors
    });
  }

  // Error de clave única de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un registro con estos datos',
      field: err.errors[0]?.path || 'unknown'
    });
  }

  // Error de clave foránea de Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Referencia inválida a otro recurso'
    });
  }

  // Error de conexión a base de datos
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: 'Error de conexión a base de datos'
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  // Error de token expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Error de Multer (archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Archivo demasiado grande'
    });
  }

  // Error de Cloudinary
  if (err.http_code) {
    return res.status(err.http_code).json({
      success: false,
      message: 'Error al procesar archivo multimedia',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Error de sintaxis JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido en el cuerpo de la solicitud'
    });
  }

  // Error 404 personalizado
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      message: err.message || 'Recurso no encontrado'
    });
  }

  // Error 403 personalizado
  if (err.status === 403) {
    return res.status(403).json({
      success: false,
      message: err.message || 'Acceso denegado'
    });
  }

  // Error genérico del servidor
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};

// Middleware para manejar rutas no encontradas
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// Middleware para capturar errores asíncronos
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};