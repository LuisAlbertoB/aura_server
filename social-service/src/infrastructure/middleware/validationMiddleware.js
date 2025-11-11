const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validaciones para Publications (Posts)
const validateCreatePublication = [
  body('content')
    .optional()
    .isLength({ min: 1, max: 5000 })
    .withMessage('El contenido debe tener entre 1 y 5000 caracteres')
    .trim(),
  
  body('type')
    .optional()
    .isIn(['text', 'image', 'video', 'text_image'])
    .withMessage('Tipo de publicación inválido'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'friends'])
    .withMessage('Visibilidad inválida'),
  
  body('location')
    .optional()
    .isLength({ max: 255 })
    .withMessage('La ubicación no puede exceder 255 caracteres')
    .trim(),
  
  body('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length <= 10) {
            return true;
          }
        } catch (e) {
          throw new Error('Tags debe ser un JSON válido');
        }
      }
      throw new Error('Tags debe ser un array con máximo 10 elementos');
    }),
  
  handleValidationErrors
];

const validateUpdatePublication = [
  body('content')
    .optional()
    .isLength({ min: 1, max: 5000 })
    .withMessage('El contenido debe tener entre 1 y 5000 caracteres')
    .trim(),
  
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'friends'])
    .withMessage('Visibilidad inválida'),
  
  body('location')
    .optional()
    .isLength({ max: 255 })
    .withMessage('La ubicación no puede exceder 255 caracteres')
    .trim(),
  
  body('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length <= 10) {
            return true;
          }
        } catch (e) {
          throw new Error('Tags debe ser un JSON válido');
        }
      }
      throw new Error('Tags debe ser un array con máximo 10 elementos');
    }),
  
  handleValidationErrors
];

const validateGetPublications = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe ser entre 1 y 50'),
  
  query('type')
    .optional()
    .isIn(['text', 'image', 'video', 'text_image'])
    .withMessage('Tipo de publicación inválido'),
  
  query('visibility')
    .optional()
    .isIn(['public', 'private', 'friends'])
    .withMessage('Visibilidad inválida'),
  
  query('userId')
    .optional()
    .isUUID(4)
    .withMessage('ID de usuario inválido'),
  
  handleValidationErrors
];

// Validaciones para UserProfile
const validateUpdateProfile = [
  body('bio')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('La biografía debe tener entre 1 y 500 caracteres')
    .trim(),
  
  body('interests')
    .optional()
    .isArray()
    .withMessage('Los intereses deben ser un array')
    .custom((value) => {
      if (value.length > 20) {
        throw new Error('Máximo 20 intereses permitidos');
      }
      return true;
    }),
  
  body('interests.*')
    .isLength({ min: 1, max: 50 })
    .withMessage('Cada interés debe tener entre 1 y 50 caracteres'),
  
  handleValidationErrors
];

const validateAddFriend = [
  body('friendId')
    .notEmpty()
    .isUUID(4)
    .withMessage('ID de amigo inválido'),
  
  handleValidationErrors
];

const validateBlockUser = [
  body('blockedUserId')
    .notEmpty()
    .isUUID(4)
    .withMessage('ID de usuario a bloquear inválido'),
  
  handleValidationErrors
];

// Validaciones para Comments
const validateCreateComment = [
  body('content')
    .notEmpty()
    .isLength({ min: 1, max: 2000 })
    .withMessage('El comentario debe tener entre 1 y 2000 caracteres')
    .trim(),
  
  body('parentId')
    .optional()
    .isUUID(4)
    .withMessage('ID del comentario padre inválido'),
  
  handleValidationErrors
];

const validateUpdateComment = [
  body('content')
    .notEmpty()
    .isLength({ min: 1, max: 2000 })
    .withMessage('El comentario debe tener entre 1 y 2000 caracteres')
    .trim(),
  
  handleValidationErrors
];

const validateGetComments = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe ser entre 1 y 50'),
  
  handleValidationErrors
];

// Validaciones para Likes
const validateLike = [
  body('type')
    .optional()
    .isIn(['like', 'dislike', 'love', 'angry', 'sad', 'wow'])
    .withMessage('Tipo de reacción inválido'),
  
  handleValidationErrors
];

const validateGetLikes = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El límite debe ser entre 1 y 50'),
  
  query('type')
    .optional()
    .isIn(['like', 'dislike', 'love', 'angry', 'sad', 'wow'])
    .withMessage('Tipo de reacción inválido'),
  
  handleValidationErrors
];

// Validaciones de parámetros
const validatePublicationId = [
  param('id').isUUID(4).withMessage('ID de publicación inválido'),
  handleValidationErrors
];

const validateCommentId = [
  param('id').isUUID(4).withMessage('ID de comentario inválido'),
  handleValidationErrors
];

const validateUserId = [
  param('userId').isUUID(4).withMessage('ID de usuario inválido'),
  handleValidationErrors
];

const validateFriendId = [
  param('friendId').isUUID(4).withMessage('ID de amigo inválido'),
  handleValidationErrors
];

module.exports = {
  validateCreatePublication,
  validateUpdatePublication,
  validateGetPublications,
  validateUpdateProfile,
  validateAddFriend,
  validateBlockUser,
  validateCreateComment,
  validateUpdateComment,
  validateGetComments,
  validateLike,
  validateGetLikes,
  validatePublicationId,
  validateCommentId,
  validateUserId,
  validateFriendId,
  handleValidationErrors
};