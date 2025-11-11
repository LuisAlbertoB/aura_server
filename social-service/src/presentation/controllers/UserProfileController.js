
class UserProfileController {
  constructor(
    createUserProfileUseCase,
    updateProfileUseCase,
    updateInterestsUseCase,
    addFriendUseCase,
    removeFriendUseCase,
    blockUserUseCase,
    unblockUserUseCase
  ) {
    this.createUserProfileUseCase = createUserProfileUseCase;
    this.updateProfileUseCase = updateProfileUseCase;
    this.updateInterestsUseCase = updateInterestsUseCase;
    this.addFriendUseCase = addFriendUseCase;
    this.removeFriendUseCase = removeFriendUseCase;
    this.blockUserUseCase = blockUserUseCase;
    this.unblockUserUseCase = unblockUserUseCase;

    // Bind methods
    this.createProfile = this.createProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.updateInterests = this.updateInterests.bind(this);
    this.addFriend = this.addFriend.bind(this);
    this.removeFriend = this.removeFriend.bind(this);
    this.blockUser = this.blockUser.bind(this);
    this.unblockUser = this.unblockUser.bind(this);
  }

  /**
   * Crear perfil de usuario
   * POST /api/v1/profiles
   */
  async createProfile(req, res) {
    try {
      console.log('📝 CreateProfile - req.body completo:', req.body);
      
      const { 
        userId, 
        displayName, 
        username, 
        email, 
        fullName, 
        bio, 
        interests, 
        avatarUrl, 
        location, 
        website, 
        birthDate,
        gender
      } = req.body;
      
      
      // Usar displayName en prioridad, luego fullName, luego username
      const finalDisplayName = displayName || fullName || username || email || 'Usuario Anónimo';

      console.log('📝 CreateProfile - Datos procesados:', {
        finalUserId,
        finalDisplayName,
        bio,
        avatarUrl,
        location,
        website,
        birthDate
      });

      if (!req.user?.id) {
        return res.status(400).json({
          success: false,
          message: 'userId es requerido para crear perfil'
        });
      }

      const result = await this.createUserProfileUseCase.execute({ // El userId se obtiene del token
        userId: finalUserId,  // Cambié de 'id' a 'userId'
        displayName: finalDisplayName,
        email,
        username,
        fullName,
        bio,
        interests,
        avatarUrl,
        location,
        website,
        birthDate
      });

      res.status(201).json({
        success: true,
        message: 'Perfil creado exitosamente',
        data: result.userProfile || result
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

   /**
   * Actualizar perfil
   * PUT /api/v1/profiles
   */
  async updateProfile(req, res) {
    try {
      const { username, email, fullName, bio, avatarUrl, location, website, birthDate } = req.body;
      const userId = req.user.id;
      // Verificar que el usuario puede actualizar este perfil (opcional para testing)
      if (req.user?.id && req.user.id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar este perfil'
        });
      }

      const result = await this.updateProfileUseCase.execute(userId, {
        email,
        username,
        fullName,
        bio,
        avatarUrl,
        location,
        website,
        birthDate
      });

      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: result.userProfile || result
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Actualizar intereses
   * PUT /api/v1/users/:userId/interests
   */
  async updateInterests(req, res) {
    try {
      const userId = req.user.id;
      const { interests } = req.body;
      
      this._verifyOwnership(req.user.id, userId);

      const result = await this.updateInterestsUseCase.execute(userId, interests);

      res.status(200).json({
        success: true,
        message: 'Intereses actualizados exitosamente',
        data: result.userProfile
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Agregar amigo - NUEVA FUNCIONALIDAD
   * POST /api/v1/profiles/:userId/friends
   */
  async addFriend(req, res) {
    try {
      console.log('👥 AddFriend controller - params:', req.params);
      console.log('👥 AddFriend controller - body:', req.body);
      
      const userId = req.user.id;
      const { friendId } = req.body;
      
      // Validar que se proporcione friendId
      if (!friendId) {
        return res.status(400).json({
          success: false,
          message: 'friendId es requerido en el cuerpo de la petición'
        });
      }
      
      // Verificar permisos de forma flexible (para testing permitimos sin auth)
      if (req.user?.id && req.user.id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para agregar amigos a este perfil'
        });
      }

      console.log('👥 Ejecutando AddFriendUseCase con userId:', userId, 'friendId:', friendId);
      const result = await this.addFriendUseCase.execute(userId, friendId);

      res.status(201).json({
        success: true,
        message: 'Amigo agregado exitosamente',
        data: result
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Remover amigo - NUEVA FUNCIONALIDAD
   * DELETE /api/v1/users/:userId/friends/:friendId
   */
  async removeFriend(req, res) {
    try {
      const { friendId } = req.params;
      
      this._verifyOwnership(req.user.id, userId);

      const result = await this.removeFriendUseCase.execute(userId, friendId);

      res.status(200).json({
        success: true,
        message: 'Amigo removido exitosamente',
        data: result
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Bloquear usuario - NUEVA FUNCIONALIDAD
   * POST /api/v1/profiles/:userId/blocked-users
   */
  async blockUser(req, res) {
    try {
      console.log('🚫 BlockUser controller - params:', req.params);
      console.log('🚫 BlockUser controller - body:', req.body);
      
      const userId = req.user.id;
      const { userIdToBlock } = req.body;
      
      // Validar que se proporcione userIdToBlock
      if (!userIdToBlock) {
        return res.status(400).json({
          success: false,
          message: 'userIdToBlock es requerido en el cuerpo de la petición'
        });
      }
      
      // Verificar permisos de forma flexible (para testing permitimos sin auth)
      if (req.user?.id && req.user.id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para bloquear usuarios en este perfil'
        });
      }

      console.log('🚫 Ejecutando BlockUserUseCase con userId:', userId, 'userIdToBlock:', userIdToBlock);
      const result = await this.blockUserUseCase.execute(userId, userIdToBlock);

      res.status(201).json({
        success: true,
        message: 'Usuario bloqueado exitosamente',
        data: result
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Desbloquear usuario - NUEVA FUNCIONALIDAD
   * DELETE /api/v1/users/:userId/blocked-users/:blockedUserId
   */
  async unblockUser(req, res) {
    try {
      const { userId, blockedUserId } = req.params;
      
      this._verifyOwnership(req.user.id, userId);

      const result = await this.unblockUserUseCase.execute(userId, blockedUserId);

      res.status(200).json({
        success: true,
        message: 'Usuario desbloqueado exitosamente',
        data: result
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Verificar que el usuario tiene permisos para modificar el recurso
   */
  _verifyOwnership(requestUserId, resourceUserId) {
    if (requestUserId !== resourceUserId) {
      throw new Error('No tienes permisos para realizar esta acción');
    }
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  _handleError(res, error) {
    console.error('Error en UserProfileController:', error.message);
    
    if (error.message.includes('no encontrado') || error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('no tienes permisos') || error.message.includes('unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('requerido') || error.message.includes('inválido') || 
        error.message.includes('ya existe') || error.message.includes('ya está')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = UserProfileController;
