const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../infrastructure/middleware/authMiddleware');
const validationMiddleware = require('../../infrastructure/middleware/validationMiddleware');
const { uploadAvatar } = require('../../infrastructure/middleware/uploadMiddleware');

// Importar directamente el controlador
const CompleteProfileController = require('../controllers/CompleteProfileController');
const completeProfileController = new CompleteProfileController();

/**
 * @swagger
 * /api/complete-profile:
 *   get:
 *     summary: Obtener perfil completo del usuario
 *     tags: [Complete Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil completo del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 full_name:
 *                   type: string
 *                 age:
 *                   type: integer
 *                 bio:
 *                   type: string
 *                 profile_picture_url:
 *                   type: string
 *                 hobbies:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Perfil completo no encontrado
 */
router.get('/', 
  authMiddleware,
  completeProfileController.getCompleteProfile.bind(completeProfileController)
);

/**
 * @swagger
 * /api/complete-profile:
 *   post:
 *     summary: Crear perfil completo del usuario
 *     tags: [Complete Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - age
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               age:
 *                 type: integer
 *                 minimum: 13
 *                 maximum: 120
 *                 description: Edad del usuario
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 description: Biografía del usuario
 *               hobbies:
 *                 type: string
 *                 description: Hobbies del usuario separados por comas
               avatar:
                 type: string
                 format: binary
                 description: Imagen de perfil (avatar)
 *             example:
 *               full_name: "Juan Pérez García"
 *               age: 25
 *               bio: "Desarrollador de software apasionado por la tecnología y los viajes"
 *               hobbies: "programación,viajes,fotografía,lectura"
 *     responses:
 *       201:
 *         description: Perfil completo creado exitosamente
 *       400:
 *         description: Datos de entrada inválidos o perfil ya existe
 */
router.post('/',
  authMiddleware,
  uploadAvatar,
  validationMiddleware.validateCompleteProfile,
  completeProfileController.createCompleteProfile.bind(completeProfileController)
);

/**
 * @swagger
 * /api/complete-profile:
 *   put:
 *     summary: Actualizar perfil completo del usuario
 *     tags: [Complete Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Nombre completo del usuario
 *               age:
 *                 type: integer
 *                 minimum: 13
 *                 maximum: 120
 *                 description: Edad del usuario
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 description: Biografía del usuario
 *               hobbies:
 *                 type: string
 *                 description: Hobbies del usuario separados por comas
               avatar:
                 type: string
                 format: binary
                 description: Nueva imagen de perfil (avatar)
 *             example:
 *               full_name: "Juan Pérez García"
 *               age: 26
 *               bio: "Senior Developer especializado en Node.js y React"
 *               hobbies: "programación,viajes,fotografía,lectura,gaming"
 *     responses:
 *       200:
 *         description: Perfil completo actualizado exitosamente
 *       404:
 *         description: Perfil completo no encontrado
 *       400:
 *         description: Datos de entrada inválidos
 */
router.put('/', 
  authMiddleware,
  uploadAvatar,
  validationMiddleware.validateCompleteProfileUpdate,
  completeProfileController.updateCompleteProfile.bind(completeProfileController)
);

/**
 * @swagger
 * /api/complete-profile:
 *   delete:
 *     summary: Eliminar perfil completo del usuario
 *     tags: [Complete Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil completo eliminado exitosamente
 *       404:
 *         description: Perfil completo no encontrado
 */
router.delete('/', 
  authMiddleware,
  completeProfileController.deleteCompleteProfile.bind(completeProfileController)
);

/**
 * @swagger
 * /api/complete-profile/{userId}:
 *   get:
 *     summary: Obtener perfil completo de otro usuario (público)
 *     tags: [Complete Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario cuyo perfil se quiere ver
 *     responses:
 *       200:
 *         description: Perfil completo del usuario solicitado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 full_name:
 *                   type: string
 *                 age:
 *                   type: integer
 *                 bio:
 *                   type: string
 *                 profile_picture_url:
 *                   type: string
 *                 hobbies:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Perfil completo no encontrado o usuario no existe
 */
router.get('/:userId', completeProfileController.getUserCompleteProfile.bind(completeProfileController));

module.exports = router;