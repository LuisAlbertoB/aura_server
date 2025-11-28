const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../infrastructure/middleware/authMiddleware');
const validationMiddleware = require('../../infrastructure/middleware/validationMiddleware');

// Importar directamente el controlador
const PreferencesController = require('../controllers/PreferencesController');
const preferencesController = new PreferencesController();

/**
 * @swagger
 * /api/preferences:
 *   get:
 *     summary: Obtener preferencias del usuario
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferencias del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Deportes:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 10
 *                 Arte:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 10
 *                 Música:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 10
 *                 Tecnología:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 10
 *                 Ciencia:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 10
 *                 Viajes:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 10
 *                 Cocina:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 10
 *                 Lectura:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 10
 *                 Entretenimiento:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 10
 *                 Naturaleza:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 10
 *                 Historia:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 10
 *                 Moda:
 *                   type: integer
 *                   minimum: 1
 *                   maximum: 10
 *       404:
 *         description: Preferencias no encontradas
 */
router.get('/', 
  authMiddleware,
  preferencesController.getUserPreferences.bind(preferencesController)
);

/**
 * @swagger
 * /api/preferences:
 *   post:
 *     summary: Crear o actualizar preferencias del usuario
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Deportes:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Arte:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Música:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Tecnología:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Ciencia:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Viajes:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Cocina:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Lectura:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Entretenimiento:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Naturaleza:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Historia:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Moda:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *             example:
 *               Deportes: 8
 *               Arte: 6
 *               Música: 9
 *               Tecnología: 7
 *               Ciencia: 5
 *               Viajes: 8
 *               Cocina: 4
 *               Lectura: 7
 *               Entretenimiento: 6
 *               Naturaleza: 9
 *               Historia: 5
 *               Moda: 3
 *     responses:
 *       200:
 *         description: Preferencias actualizadas exitosamente
 *       201:
 *         description: Preferencias creadas exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', 
  authMiddleware,
  validationMiddleware.validatePreferences,
  preferencesController.updateUserPreferences.bind(preferencesController)
);

/**
 * @swagger
 * /api/preferences:
 *   put:
 *     summary: Actualizar preferencias del usuario (alias de POST)
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Deportes:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Arte:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Música:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Tecnología:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Ciencia:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Viajes:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Cocina:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Lectura:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Entretenimiento:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Naturaleza:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Historia:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               Moda:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *     responses:
 *       200:
 *         description: Preferencias actualizadas exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Preferencias no encontradas
 */
router.put('/', 
  authMiddleware,
  validationMiddleware.validatePreferences,
  preferencesController.updateUserPreferences.bind(preferencesController)
);

/**
 * @swagger
 * /api/preferences:
 *   delete:
 *     summary: Eliminar preferencias del usuario
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferencias eliminadas exitosamente
 *       404:
 *         description: Preferencias no encontradas
 */
router.delete('/', 
  authMiddleware,
  preferencesController.deleteUserPreferences.bind(preferencesController)
);

/**
 * @swagger
 * /api/preferences/categories:
 *   get:
 *     summary: Obtener lista de todas las categorías de preferencias disponibles
 *     tags: [Preferences]
 *     responses:
 *       200:
 *         description: Lista de categorías disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: 
 *                 - "Deportes"
 *                 - "Arte"
 *                 - "Música"
 *                 - "Tecnología"
 *                 - "Ciencia"
 *                 - "Viajes"
 *                 - "Cocina"
 *                 - "Lectura"
 *                 - "Entretenimiento"
 *                 - "Naturaleza"
 *                 - "Historia"
 *                 - "Moda"
 */
router.get('/categories', preferencesController.getAvailablePreferences.bind(preferencesController));

module.exports = router;