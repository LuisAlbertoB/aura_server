// routes/availableUsersRoutes.js

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../infrastructure/middleware/authMiddleware');
const AvailableUsersController = require('../controllers/AvailableUsersController');

const availableUsersController = new AvailableUsersController();

/**
 * @swagger
 * /api/v1/users/available:
 *   get:
 *     summary: Obtener usuarios disponibles (NO amigos del usuario actual)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Usuarios por página
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Buscar por nombre, email o rol
 *     responses:
 *       200:
 *         description: Lista de usuarios disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       profile:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                           display_name:
 *                             type: string
 *                           avatar_url:
 *                             type: string
 *                           bio:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                 meta:
 *                   type: object
 *                   properties:
 *                     excluded_users_count:
 *                       type: integer
 *                       description: Cantidad de usuarios excluidos (amigos, pendientes, bloqueados)
 *                     search_query:
 *                       type: string
 *                       nullable: true
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/', 
  authMiddleware,
  availableUsersController.getAvailableUsers.bind(availableUsersController)
);

module.exports = router;