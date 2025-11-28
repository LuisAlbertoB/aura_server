const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../infrastructure/middleware/authMiddleware');
const validationMiddleware = require('../../infrastructure/middleware/validationMiddleware');
const upload = require('../../infrastructure/middleware/uploadMiddleware');

// Importar directamente el controlador
const CommunityController = require('../controllers/CommunityController');
const communityController = new CommunityController();

/**
 * @swagger
 * /api/communities:
 *   post:
 *     summary: Crear una nueva comunidad
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: string
 *               privacy:
 *                 type: string
 *                 enum: [public, private]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Comunidad creada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/', 
  authMiddleware, 
  upload.single('image'),
  validationMiddleware.validateCommunityCreation,
  communityController.createCommunity.bind(communityController)
);

/**
 * @swagger
 * /api/communities:
 *   get:
 *     summary: Obtener todas las comunidades públicas
 *     tags: [Communities]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Cantidad de elementos por página
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *     responses:
 *       200:
 *         description: Lista de comunidades
 */
router.get('/', communityController.getAllCommunities.bind(communityController));

/**
 * @swagger
 * /api/communities/{id}:
 *   get:
 *     summary: Obtener una comunidad por ID
 *     tags: [Communities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la comunidad
 *       404:
 *         description: Comunidad no encontrada
 */
router.get('/:id', communityController.getCommunityById.bind(communityController));

/**
 * @swagger
 * /api/communities/{id}:
 *   put:
 *     summary: Actualizar una comunidad
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: string
 *               privacy:
 *                 type: string
 *                 enum: [public, private]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Comunidad actualizada exitosamente
 *       403:
 *         description: No tienes permisos para actualizar esta comunidad
 *       404:
 *         description: Comunidad no encontrada
 */
router.put('/:id', 
  authMiddleware,
  upload.single('image'),
  validationMiddleware.validateCommunityUpdate,
  communityController.updateCommunity.bind(communityController)
);

/**
 * @swagger
 * /api/communities/{id}:
 *   delete:
 *     summary: Eliminar una comunidad
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comunidad eliminada exitosamente
 *       403:
 *         description: No tienes permisos para eliminar esta comunidad
 *       404:
 *         description: Comunidad no encontrada
 */
router.delete('/:id', 
  authMiddleware,
  communityController.deleteCommunity.bind(communityController)
);

/**
 * @swagger
 * /api/communities/{id}/join:
 *   post:
 *     summary: Unirse a una comunidad
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Te has unido a la comunidad exitosamente
 *       400:
 *         description: Ya eres miembro de esta comunidad
 *       404:
 *         description: Comunidad no encontrada
 */
router.post('/:id/join', 
  authMiddleware,
  communityController.joinCommunity.bind(communityController)
);

/**
 * @swagger
 * /api/communities/{id}/leave:
 *   post:
 *     summary: Salir de una comunidad
 *     tags: [Communities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Has salido de la comunidad exitosamente
 *       400:
 *         description: No eres miembro de esta comunidad
 *       404:
 *         description: Comunidad no encontrada
 */
router.post('/:id/leave', 
  authMiddleware,
  communityController.leaveCommunity.bind(communityController)
);

/**
 * @swagger
 * /api/communities/{id}/members:
 *   get:
 *     summary: Obtener miembros de una comunidad
 *     tags: [Communities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Cantidad de elementos por página
 *     responses:
 *       200:
 *         description: Lista de miembros de la comunidad
 *       404:
 *         description: Comunidad no encontrada
 */
router.get('/:id/members', communityController.getCommunityMembers.bind(communityController));

module.exports = router;