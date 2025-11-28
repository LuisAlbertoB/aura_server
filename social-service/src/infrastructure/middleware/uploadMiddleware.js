const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');

// Configuración de almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'social-service', // Carpeta en Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov', 'webm'],
    resource_type: 'auto', // Permite imágenes y videos
    transformation: [
      {
        quality: 'auto:good',
        fetch_format: 'auto'
      }
    ]
  }
});

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB máximo por archivo
    files: 10 // Máximo 10 archivos por solicitud
  },
  fileFilter: (req, file, cb) => {
    // Verificar tipos de archivo permitidos
    const allowedMimes = [
      // Imágenes
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      // Videos
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/webm',
      'video/quicktime'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Tipos permitidos: ${allowedMimes.join(', ')}`), false);
    }
  }
});

// Middleware para manejar errores de multer
const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'El archivo es demasiado grande. Tamaño máximo: 100MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Demasiados archivos. Máximo permitido: 10 archivos'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Campo de archivo inesperado'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Error al subir archivo',
          error: error.message
        });
    }
  }

  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Error de Cloudinary u otro error
  console.error('Error de upload:', error);
  return res.status(500).json({
    success: false,
    message: 'Error interno al procesar archivos'
  });
};

// Middleware personalizado para validar archivos después de la subida
const validateUploadedFiles = (req, res, next) => {
  if (req.files && req.files.length > 0) {
    // Validar que los archivos se subieron correctamente
    const invalidFiles = req.files.filter(file => !file.path || !file.filename);
    
    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Algunos archivos no se procesaron correctamente'
      });
    }

    // Agregar información adicional a los archivos
    req.files = req.files.map(file => ({
      ...file,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      url: file.path,
      cloudinary_public_id: file.filename
    }));
  }

  next();
};

// =============================================
// CONFIGURACIÓN ESPECÍFICA PARA PERFILES
// =============================================

// Storage específico para avatares de perfil
const profileAvatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profiles/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      {
        width: 500,
        height: 500,
        crop: 'fill',
        quality: 'auto:good',
        fetch_format: 'auto'
      }
    ],
    public_id: (req, file) => {
      // Generar nombre único usando user_id y timestamp
      const userId = req.user?.id || 'unknown';
      const timestamp = Date.now();
      return `avatar_${userId}_${timestamp}`;
    }
  }
});

// Configuración de multer específica para perfil
const profileUpload = multer({
  storage: profileAvatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB en bytes
    files: 1 // Solo un archivo
  },
  fileFilter: (req, file, cb) => {
    // Validar que sea el campo correcto
    if (file.fieldname !== 'avatar') {
      return cb(new Error('Campo de archivo inválido. Usa "avatar"'), false);
    }

    // Validar tipo MIME
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Formato de imagen no válido. Usa JPG, PNG, GIF o WEBP'), false);
    }

    cb(null, true);
  }
});

/**
 * Middleware para manejar upload de avatar de perfil
 * Procesa exactamente un archivo con el campo 'avatar'
 */
const uploadAvatar = (req, res, next) => {
  const upload = profileUpload.single('avatar');

  upload(req, res, (err) => {
    if (err) {
      console.error('❌ Error en upload de avatar:', err.message);

      // Manejar diferentes tipos de errores
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            message: 'La imagen no puede superar 5MB'
          });
        }
        
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Solo se permite una imagen de perfil'
          });
        }

        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Campo de archivo inesperado. Usa "avatar"'
          });
        }

        return res.status(400).json({
          success: false,
          message: 'Error en la carga del archivo'
        });
      }

      // Error personalizado de validación
      if (err.message.includes('Formato de imagen no válido')) {
        return res.status(415).json({
          success: false,
          message: err.message
        });
      }

      if (err.message.includes('Campo de archivo inválido')) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      // Error genérico
      return res.status(500).json({
        success: false,
        message: 'Error al procesar la imagen de perfil'
      });
    }

    // Si no se sube archivo, continuar
    if (!req.file) {
      console.log('No se subió avatar, continuando...');
      return next();
    }

    console.log('✅ Avatar subido exitosamente:', {
      filename: req.file.filename,
      url: req.file.path,
      size: req.file.size
    });

    // Agregar URL de avatar al request
    req.avatarUrl = req.file.path;

    next();
  });
};

module.exports = {
  upload,
  handleUploadErrors,
  validateUploadedFiles,
  // Exportar métodos específicos de multer para diferentes usos
  single: (fieldName) => upload.single(fieldName),
  array: (fieldName, maxCount) => upload.array(fieldName, maxCount),
  fields: (fields) => upload.fields(fields),
  // Nuevos métodos específicos para perfiles
  uploadAvatar,
  profileUpload
};