const express = require('express');
const { register, login, getProfile, getAllUsers } = require('../controllers/authController');
const { registerValidation, loginValidation, sanitizeInput } = require('../middlewares/validationMiddleware');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Ruta de registro con validación y sanitización
router.post('/register', sanitizeInput, registerValidation, register);

// Ruta de login con validación y sanitización
router.post('/login', sanitizeInput, loginValidation, login);

// Ruta para obtener el perfil del usuario autenticado (requiere token JWT)
router.get('/profile', verifyToken, getProfile);

// Ruta para obtener todos los usuarios (requiere token JWT y rol de administrador)
router.get('/users', verifyToken, authorizeRole(['admin']), getAllUsers);

module.exports = router;