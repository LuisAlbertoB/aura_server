const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../infrastructure/middleware/authMiddleware');
const validationMiddleware = require('../../infrastructure/middleware/validationMiddleware');

// Importar directamente el controlador
const FriendshipController = require('../controllers/FriendshipController');
const friendshipController = new FriendshipController();

/**
 * @swagger
 * /api/friendships/send:
 *   post:
 *     summary: Enviar solicitud de amistad
 *     tags: [Friendships]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - friend_id
 *             properties:
 *               friend_id:
 *                 type: integer
 *                 description: ID del usuario al que se le envía la solicitud
 *             example:
 *               friend_id: 123
 *     responses:
 *       201:
 *         description: Solicitud de amistad enviada exitosamente
 *       400:
 *         description: Solicitud inválida (ya son amigos, solicitud pendiente, etc.)
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/send', 
  authMiddleware,
  validationMiddleware.validateFriendshipRequest,
  friendshipController.sendFriendRequest.bind(friendshipController)
);

/**
 * @swagger
 * /api/friendships/accept/{friendshipId}:
 *   put:
 *     summary: Aceptar solicitud de amistad
 *     tags: [Friendships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendshipId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud de amistad
 *     responses:
 *       200:
 *         description: Solicitud de amistad aceptada exitosamente
 *       404:
 *         description: Solicitud de amistad no encontrada
 *       403:
 *         description: No tienes permisos para aceptar esta solicitud
 *       400:
 *         description: La solicitud ya fue procesada
 */
router.put('/accept/:friendshipId', 
  authMiddleware,
  friendshipController.acceptFriendRequest.bind(friendshipController)
);

/**
 * @swagger
 * /api/friendships/reject/{friendshipId}:
 *   put:
 *     summary: Rechazar solicitud de amistad
 *     tags: [Friendships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendshipId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud de amistad
 *     responses:
 *       200:
 *         description: Solicitud de amistad rechazada exitosamente
 *       404:
 *         description: Solicitud de amistad no encontrada
 *       403:
 *         description: No tienes permisos para rechazar esta solicitud
 *       400:
 *         description: La solicitud ya fue procesada
 */
router.put('/reject/:friendshipId', 
  authMiddleware,
  friendshipController.rejectFriendRequest.bind(friendshipController)
);

/**
 * @swagger
 * /api/friendships:
 *   get:
 *     summary: Obtener lista de amigos del usuario
 *     tags: [Friendships]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Lista de amigos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 friends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_id:
 *                         type: integer
 *                       friend_id:
 *                         type: integer
 *                       status:
 *                         type: string
 *                         enum: [accepted]
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 */
router.get('/', 
  authMiddleware,
  friendshipController.getFriends.bind(friendshipController)
);

/**
 * @swagger
 * /api/friendships/pending:
 *   get:
 *     summary: Obtener solicitudes de amistad pendientes
 *     tags: [Friendships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [received, sent]
 *         description: Tipo de solicitudes (recibidas o enviadas)
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
 *         description: Lista de solicitudes de amistad pendientes
 */
router.get('/pending', 
  authMiddleware,
  friendshipController.getFriendRequests.bind(friendshipController)
);

/**
 * @swagger
 * /api/friendships/{friendId}:
 *   delete:
 *     summary: Eliminar amistad
 *     tags: [Friendships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del amigo a eliminar
 *     responses:
 *       200:
 *         description: Amistad eliminada exitosamente
 *       404:
 *         description: Amistad no encontrada
 */
router.delete('/:friendId', 
  authMiddleware,
  friendshipController.removeFriend.bind(friendshipController)
);

/**
 * @swagger
 * /api/friendships/block:
 *   post:
 *     summary: Bloquear usuario
 *     tags: [Friendships]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - blocked_id
 *             properties:
 *               blocked_id:
 *                 type: integer
 *                 description: ID del usuario a bloquear
 *             example:
 *               blocked_id: 123
 *     responses:
 *       201:
 *         description: Usuario bloqueado exitosamente
 *       400:
 *         description: Usuario ya bloqueado o datos inválidos
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/block', 
  authMiddleware,
  validationMiddleware.validateBlockUserRequest,
  friendshipController.blockUser.bind(friendshipController)
);

/**
 * @swagger
 * /api/friendships/unblock/{blockedId}:
 *   delete:
 *     summary: Desbloquear usuario
 *     tags: [Friendships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blockedId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a desbloquear
 *     responses:
 *       200:
 *         description: Usuario desbloqueado exitosamente
 *       404:
 *         description: Bloqueo no encontrado
 */
router.delete('/unblock/:blockedId', 
  authMiddleware,
  friendshipController.unblockUser.bind(friendshipController)
);

/**
 * @swagger
 * /api/friendships/blocked:
 *   get:
 *     summary: Obtener lista de usuarios bloqueados
 *     tags: [Friendships]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Lista de usuarios bloqueados
 */
router.get('/blocked', 
  authMiddleware,
  friendshipController.getBlockedUsers.bind(friendshipController)
);

/**
 * @swagger
 * /api/friendships/status/{userId}:
 *   get:
 *     summary: Obtener estado de amistad con un usuario específico
 *     tags: [Friendships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario para verificar el estado
 *     responses:
 *       200:
 *         description: Estado de la relación con el usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [friends, pending_sent, pending_received, blocked, none]
 *                 friendship_id:
 *                   type: integer
 *                   nullable: true
 */
router.get('/status/:userId', 
  authMiddleware,
  friendshipController.getFriendshipStatus.bind(friendshipController)
);

module.exports = router;