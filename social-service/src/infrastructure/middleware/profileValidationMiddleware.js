/**
 * Middleware de validación específico para perfiles
 * Implementa todas las validaciones según especificaciones técnicas
 */

/**
 * Validar displayName (REQUERIDO)
 * - No puede estar vacío
 * - Mínimo 1 carácter, máximo 100 caracteres
 * - Aplicar trim
 */
const validateDisplayName = (req, res, next) => {
  console.log('🔍 Validating displayName. Body:', req.body);
  const { displayName } = req.body;

  if (!displayName || displayName.trim() === '' || displayName === 'null') {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: [
        {
          field: 'displayName',
          message: 'displayName es requerido y no puede ser "null"'
        }
      ]
    });
  }

  const trimmedDisplayName = displayName.trim();

  if (trimmedDisplayName.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: [
        {
          field: 'displayName',
          message: 'displayName no puede tener más de 100 caracteres'
        }
      ]
    });
  }

  // Asignar el valor limpio al request
  req.body.displayName = trimmedDisplayName;
  next();
};

/**
 * Validar bio (OPCIONAL)
 * - Si no se envía o viene vacío: null
 * - Máximo 500 caracteres
 * - Aplicar trim
 */
const validateBio = (req, res, next) => {
  console.log('🔍 Validating bio. Body:', req.body);
  let { bio } = req.body;

  // Si no se envía, está vacío o es el string "null", asignar null
  if (!bio || bio.trim() === '' || bio === 'null') {
    req.body.bio = null;
    return next();
  }

  const trimmedBio = bio.trim();

  if (trimmedBio.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: [
        {
          field: 'bio',
          message: 'La biografía no puede superar 500 caracteres'
        }
      ]
    });
  }

  // Asignar el valor limpio al request
  req.body.bio = trimmedBio;
  next();
};

/**
 * Validar birthDate (OPCIONAL)
 * - Si no se envía o viene vacío: null
 * - Formato estricto: "YYYY-MM-DD"
 * - Validar que sea fecha válida
 * - Edad >= 13 años
 * - No puede ser fecha futura
 */
const validateBirthDate = (req, res, next) => {
  console.log('🔍 Validating birthDate. Body:', req.body);
  let { birthDate } = req.body;

  // Si no se envía, está vacío o es "null", asignar null
  if (!birthDate || birthDate.trim() === '' || birthDate === 'null') {
    req.body.birthDate = null;
    return next();
  }

  const trimmedBirthDate = birthDate.trim();

  // Validar formato YYYY-MM-DD
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(trimmedBirthDate)) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: [
        {
          field: 'birthDate',
          message: 'Formato de fecha inválido. Usa YYYY-MM-DD'
        }
      ]
    });
  }

  // Validar que sea una fecha válida
  const date = new Date(trimmedBirthDate);
  if (isNaN(date.getTime()) || date.toISOString().split('T')[0] !== trimmedBirthDate) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: [
        {
          field: 'birthDate',
          message: 'Formato de fecha inválido. Usa YYYY-MM-DD'
        }
      ]
    });
  }

  // Validar que no sea fecha futura
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar a medianoche
  
  if (date > today) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: [
        {
          field: 'birthDate',
          message: 'La fecha de nacimiento no puede ser en el futuro'
        }
      ]
    });
  }

  // Calcular edad y validar que sea >= 13 años
  const ageDifMs = today - date.getTime();
  const ageDate = new Date(ageDifMs);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);

  if (age < 13) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: [
        {
          field: 'birthDate',
          message: 'Debes tener al menos 13 años'
        }
      ]
    });
  }

  // Asignar el valor limpio al request
  req.body.birthDate = trimmedBirthDate;
  next();
};

/**
 * Validar gender (OPCIONAL)
 * - Si no se envía o viene vacío: null
 * - Solo valores: "male", "female", "other", "prefer_not_to_say"
 */
const validateGender = (req, res, next) => {
  console.log('🔍 Validating gender. Body:', req.body);
  let { gender } = req.body;

  // Si no se envía, está vacío o es "null", asignar null
  if (!gender || gender.trim() === '' || gender === 'null') {
    req.body.gender = null;
    return next();
  }

  const trimmedGender = gender.trim();
  const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];

  if (!validGenders.includes(trimmedGender)) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: [
        {
          field: 'gender',
          message: 'Valor de género inválido. Valores permitidos: male, female, other, prefer_not_to_say'
        }
      ]
    });
  }

  // Asignar el valor limpio al request
  req.body.gender = trimmedGender;
  next();
};

/**
 * Middleware que rechaza campos no permitidos
 * Campos NO aceptados: website, location, cover, avatarUrl
 */
const rejectForbiddenFields = (req, res, next) => {
  console.log('🔍 Rejecting forbidden fields. Body:', req.body);
  const forbiddenFields = ['website', 'location', 'cover', 'avatarUrl', 'avatar_url'];
  const receivedForbidden = [];

  forbiddenFields.forEach(field => {
    if (req.body[field] !== undefined) {
      receivedForbidden.push(field);
    }
  });

  if (receivedForbidden.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: receivedForbidden.map(field => ({
        field: field,
        message: `El campo '${field}' no es permitido`
      }))
    });
  }

  next();
};

/**
 * Validar que el Content-Type sea multipart/form-data
 */
const validateMultipartContentType = (req, res, next) => {
  console.log('🔍 Validating Content-Type. Headers:', req.headers);
  const contentType = req.headers['content-type'];
  
  if (!contentType || !contentType.includes('multipart/form-data')) {
    return res.status(400).json({
      success: false,
      message: 'Content-Type debe ser multipart/form-data'
    });
  }

  next();
};

/**
 * Middleware compuesto que aplica todas las validaciones de perfil
 * Orden: campos prohibidos → displayName → bio → birthDate → gender
 */
const validateProfileData = [
  rejectForbiddenFields,
  validateDisplayName,
  validateBio,
  validateBirthDate,
  validateGender
];

module.exports = {
  validateDisplayName,
  validateBio,
  validateBirthDate,
  validateGender,
  rejectForbiddenFields,
  validateMultipartContentType,
  validateProfileData
};