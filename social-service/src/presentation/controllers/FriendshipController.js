const { FriendshipModel, UserProfileModel } = require('../../infrastructure/database/models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

class FriendshipController {
  constructor() {
    // Bind methods para mantener contexto
    this.sendFriendRequest = this.sendFriendRequest.bind(this);
    this.acceptFriendRequest = this.acceptFriendRequest.bind(this);
    this.rejectFriendRequest = this.rejectFriendRequest.bind(this);
    this.getFriendRequests = this.getFriendRequests.bind(this);
    this.getFriends = this.getFriends.bind(this);
    this.getFriendshipStatus = this.getFriendshipStatus.bind(this);
    this.removeFriend = this.removeFriend.bind(this);
    this.blockUser = this.blockUser.bind(this);
    this.unblockUser = this.unblockUser.bind(this);
    this.getBlockedUsers = this.getBlockedUsers.bind(this);
  }

  /**
   * Enviar solicitud de amistad
   */
  async sendFriendRequest(req, res) {
    try {
      const requesterId = req.user.id;
      const { addresseeId } = req.body;

      console.log('📤 SendFriendRequest - From:', requesterId, 'To:', addresseeId);

      // Validar campos requeridos
      if (!addresseeId) {
        return res.status(400).json({
          success: false,
          message: 'addresseeId es requerido'
        });
      }

      // No se puede enviar solicitud a sí mismo
      if (requesterId === addresseeId) {
        return res.status(400).json({
          success: false,
          message: 'No puedes enviarte una solicitud de amistad a ti mismo'
        });
      }

      // Verificar que el usuario destinatario existe
      const addresseeUser = await UserProfileModel.findByPk(addresseeId);
      if (!addresseeUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuario destinatario no encontrado'
        });
      }

      // Verificar si ya existe una solicitud o amistad
      const existingFriendship = await FriendshipModel.findOne({
        where: {
          [Op.or]: [
            { requester_id: requesterId, addressee_id: addresseeId },
            { requester_id: addresseeId, addressee_id: requesterId }
          ]
        }
      });

      if (existingFriendship) {
        let message = '';
        switch (existingFriendship.status) {
          case 'pending':
            message = existingFriendship.requester_id === requesterId 
              ? 'Ya enviaste una solicitud de amistad a este usuario'
              : 'Este usuario ya te envió una solicitud de amistad';
            break;
          case 'accepted':
            message = 'Ya son amigos';
            break;
          case 'blocked':
            message = 'No se puede enviar solicitud a este usuario';
            break;
          case 'rejected':
            message = 'Solicitud previamente rechazada';
            break;
        }
        
        return res.status(400).json({
          success: false,
          message,
          existingStatus: existingFriendship.status
        });
      }

      // Crear nueva solicitud de amistad
      const friendship = await FriendshipModel.create({
        id: uuidv4(),
        requester_id: requesterId,
        addressee_id: addresseeId,
        status: 'pending'
      });

      console.log('✅ Solicitud de amistad enviada:', friendship.id);

      // Obtener la solicitud con información de usuarios
      const friendshipWithUsers = await FriendshipModel.findByPk(friendship.id, {
        include: [
          {
            model: UserProfileModel,
            as: 'requester',
            attributes: ['user_id', 'display_name', 'username', 'avatar_url']
          },
          {
            model: UserProfileModel,
            as: 'addressee',
            attributes: ['user_id', 'display_name', 'username', 'avatar_url']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Solicitud de amistad enviada exitosamente',
        data: friendshipWithUsers
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Aceptar solicitud de amistad
   */
  async acceptFriendRequest(req, res) {
    try {
      const { friendshipId } = req.params;
      const userId = req.user.id;

      console.log('✅ AcceptFriendRequest - Friendship:', friendshipId, 'User:', userId);

      const friendship = await FriendshipModel.findByPk(friendshipId);
      if (!friendship) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud de amistad no encontrada'
        });
      }

      // Solo el destinatario puede aceptar la solicitud
      if (friendship.addressee_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para aceptar esta solicitud'
        });
      }

      // Verificar que esté pendiente
      if (friendship.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `La solicitud ya fue ${friendship.status === 'accepted' ? 'aceptada' : friendship.status}`
        });
      }

      // Aceptar la solicitud
      await friendship.update({ status: 'accepted' });

      console.log('✅ Solicitud de amistad aceptada:', friendshipId);

      // Obtener la amistad con información de usuarios
      const acceptedFriendship = await FriendshipModel.findByPk(friendshipId, {
        include: [
          {
            model: UserProfileModel,
            as: 'requester',
            attributes: ['user_id', 'display_name', 'username', 'avatar_url']
          },
          {
            model: UserProfileModel,
            as: 'addressee',
            attributes: ['user_id', 'display_name', 'username', 'avatar_url']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Solicitud de amistad aceptada exitosamente',
        data: acceptedFriendship
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Rechazar solicitud de amistad
   */
  async rejectFriendRequest(req, res) {
    try {
      const { friendshipId } = req.params;
      const userId = req.user.id;

      console.log('❌ RejectFriendRequest - Friendship:', friendshipId, 'User:', userId);

      const friendship = await FriendshipModel.findByPk(friendshipId);
      if (!friendship) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud de amistad no encontrada'
        });
      }

      // Solo el destinatario puede rechazar la solicitud
      if (friendship.addressee_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para rechazar esta solicitud'
        });
      }

      // Verificar que esté pendiente
      if (friendship.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `La solicitud ya fue ${friendship.status}`
        });
      }

      // Rechazar la solicitud
      await friendship.update({ status: 'rejected' });

      console.log('✅ Solicitud de amistad rechazada:', friendshipId);

      res.status(200).json({
        success: true,
        message: 'Solicitud de amistad rechazada exitosamente'
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Obtener solicitudes de amistad pendientes
   */
  async getFriendRequests(req, res) {
    try {
      const userId = req.user.id;
      const { type = 'received' } = req.query; // 'received' o 'sent'

      console.log('📋 GetFriendRequests - User:', userId, 'Type:', type);

      let whereCondition = { status: 'pending' };

      if (type === 'received') {
        whereCondition.addressee_id = userId;
      } else if (type === 'sent') {
        whereCondition.requester_id = userId;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Tipo debe ser "received" o "sent"'
        });
      }

      const friendRequests = await FriendshipModel.findAll({
        where: whereCondition,
        include: [
          {
            model: UserProfileModel,
            as: 'requester',
            attributes: ['user_id', 'display_name', 'username', 'avatar_url']
          },
          {
            model: UserProfileModel,
            as: 'addressee',
            attributes: ['user_id', 'display_name', 'username', 'avatar_url']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        message: `Solicitudes ${type === 'received' ? 'recibidas' : 'enviadas'} obtenidas exitosamente`,
        data: friendRequests
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Obtener lista de amigos
   */
  async getFriends(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      console.log('👥 GetFriends - User:', userId);

      const { count, rows } = await FriendshipModel.findAndCountAll({
        where: {
          status: 'accepted',
          [Op.or]: [
            { requester_id: userId },
            { addressee_id: userId }
          ]
        },
        include: [
          {
            model: UserProfileModel,
            as: 'requester',
            attributes: ['user_id', 'display_name', 'username', 'avatar_url']
          },
          {
            model: UserProfileModel,
            as: 'addressee',
            attributes: ['user_id', 'display_name', 'username', 'avatar_url']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Mapear para obtener la información del amigo (no del usuario actual)
      const friends = rows.map(friendship => {
        const friend = friendship.requester_id === userId 
          ? friendship.addressee 
          : friendship.requester;
        
        return {
          friendship_id: friendship.id,
          friend,
          since: friendship.created_at
        };
      });

      res.status(200).json({
        success: true,
        message: 'Lista de amigos obtenida exitosamente',
        data: friends,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Verificar estado de amistad con un usuario
   */
  async getFriendshipStatus(req, res) {
    try {
      const userId = req.user.id;
      const { userId: targetUserId } = req.params;

      console.log('🔍 GetFriendshipStatus - User:', userId, 'Target:', targetUserId);

      if (userId === targetUserId) {
        return res.status(200).json({
          success: true,
          message: 'Estado de amistad obtenido',
          data: {
            status: 'self',
            message: 'Es tu propio perfil'
          }
        });
      }

      const friendship = await FriendshipModel.findOne({
        where: {
          [Op.or]: [
            { requester_id: userId, addressee_id: targetUserId },
            { requester_id: targetUserId, addressee_id: userId }
          ]
        },
        include: [
          {
            model: UserProfileModel,
            as: 'requester',
            attributes: ['user_id', 'display_name', 'username']
          },
          {
            model: UserProfileModel,
            as: 'addressee',
            attributes: ['user_id', 'display_name', 'username']
          }
        ]
      });

      if (!friendship) {
        return res.status(200).json({
          success: true,
          message: 'Estado de amistad obtenido',
          data: {
            status: 'none',
            message: 'Sin relación de amistad'
          }
        });
      }

      let statusMessage = '';
      let canAccept = false;
      let canReject = false;
      let canSendRequest = false;

      switch (friendship.status) {
        case 'pending':
          if (friendship.requester_id === userId) {
            statusMessage = 'Solicitud enviada (pendiente)';
          } else {
            statusMessage = 'Solicitud recibida (pendiente)';
            canAccept = true;
            canReject = true;
          }
          break;
        case 'accepted':
          statusMessage = 'Son amigos';
          break;
        case 'rejected':
          statusMessage = 'Solicitud rechazada';
          if (friendship.requester_id !== userId) {
            canSendRequest = true;
          }
          break;
        case 'blocked':
          statusMessage = 'Usuario bloqueado';
          break;
      }

      res.status(200).json({
        success: true,
        message: 'Estado de amistad obtenido exitosamente',
        data: {
          friendship_id: friendship.id,
          status: friendship.status,
          message: statusMessage,
          is_requester: friendship.requester_id === userId,
          can_accept: canAccept,
          can_reject: canReject,
          can_send_request: canSendRequest,
          created_at: friendship.created_at
        }
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Eliminar amigo / Cancelar solicitud
   */
  async removeFriend(req, res) {
    try {
      const { friendshipId } = req.params;
      const userId = req.user.id;

      console.log('🗑️ RemoveFriend - Friendship:', friendshipId, 'User:', userId);

      const friendship = await FriendshipModel.findByPk(friendshipId);
      if (!friendship) {
        return res.status(404).json({
          success: false,
          message: 'Amistad no encontrada'
        });
      }

      // Verificar que el usuario sea parte de la amistad
      if (friendship.requester_id !== userId && friendship.addressee_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar esta amistad'
        });
      }

      // Eliminar la amistad/solicitud
      await friendship.destroy();

      console.log('✅ Amistad eliminada:', friendshipId);

      res.status(200).json({
        success: true,
        message: 'Amistad eliminada exitosamente'
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Bloquear usuario
   */
  async blockUser(req, res) {
    try {
      const userId = req.user.id;
      const { userId: targetUserId } = req.body;

      console.log('🚫 BlockUser - User:', userId, 'Target:', targetUserId);

      if (userId === targetUserId) {
        return res.status(400).json({
          success: false,
          message: 'No puedes bloquearte a ti mismo'
        });
      }

      // Buscar amistad existente
      let friendship = await FriendshipModel.findOne({
        where: {
          [Op.or]: [
            { requester_id: userId, addressee_id: targetUserId },
            { requester_id: targetUserId, addressee_id: userId }
          ]
        }
      });

      if (friendship) {
        // Actualizar estado a bloqueado
        await friendship.update({ 
          status: 'blocked',
          requester_id: userId,
          addressee_id: targetUserId
        });
      } else {
        // Crear nuevo registro de bloqueo
        friendship = await FriendshipModel.create({
          id: uuidv4(),
          requester_id: userId,
          addressee_id: targetUserId,
          status: 'blocked'
        });
      }

      console.log('✅ Usuario bloqueado:', targetUserId);

      res.status(200).json({
        success: true,
        message: 'Usuario bloqueado exitosamente'
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Desbloquear usuario
   */
  async unblockUser(req, res) {
    try {
      const userId = req.user.id;
      const { userId: targetUserId } = req.params;

      console.log('✅ UnblockUser - User:', userId, 'Target:', targetUserId);

      const friendship = await FriendshipModel.findOne({
        where: {
          requester_id: userId,
          addressee_id: targetUserId,
          status: 'blocked'
        }
      });

      if (!friendship) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no está bloqueado'
        });
      }

      // Eliminar el bloqueo
      await friendship.destroy();

      console.log('✅ Usuario desbloqueado:', targetUserId);

      res.status(200).json({
        success: true,
        message: 'Usuario desbloqueado exitosamente'
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Obtener usuarios bloqueados
   */
  async getBlockedUsers(req, res) {
    try {
      const userId = req.user.id;

      console.log('🚫 GetBlockedUsers - User:', userId);

      const blockedUsers = await FriendshipModel.findAll({
        where: {
          requester_id: userId,
          status: 'blocked'
        },
        include: [
          {
            model: UserProfileModel,
            as: 'addressee',
            attributes: ['user_id', 'display_name', 'username', 'avatar_url']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        message: 'Usuarios bloqueados obtenidos exitosamente',
        data: blockedUsers
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  _handleError(res, error) {
    console.error('Error en FriendshipController:', error.message);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(e => e.message)
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una relación entre estos usuarios'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = FriendshipController;