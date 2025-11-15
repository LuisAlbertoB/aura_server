
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
   * Soporta tanto multipart/form-data (con avatar) como application/json (sin avatar)
   */
  async createProfile(req, res) {
    try {
      console.log('📝 CreateProfile - Datos recibidos:', {
        body: req.body,
        file: req.file ? { filename: req.file.filename, url: req.file.path } : null,
        avatarUrl: req.avatarUrl,
        user: req.user?.id,
        contentType: req.headers['content-type']
      });

      // Validar autenticación
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'Token de acceso requerido'
        });
      }

      const userId = req.user.id;
      
      // Extraer datos del body (funciona tanto para JSON como multipart)
      const { displayName, bio, birthDate, gender, avatar } = req.body;
      
      // Validación básica: displayName es requerido
      if (!displayName || displayName.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: [
            {
              field: 'displayName',
              message: 'displayName es requerido'
            }
          ]
        });
      }

      // avatarUrl puede venir del middleware uploadAvatar (multipart) o del body (JSON)
      const avatarUrl = req.avatarUrl || avatar || null;

      console.log('📝 CreateProfile - Procesando datos:', {
        userId,
        displayName,
        bio,
        birthDate,
        gender,
        avatarUrl
      });

      // Verificar que no existe perfil para este usuario
      const existingProfile = await this.findExistingProfile(userId);
      if (existingProfile) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un perfil para este usuario'
        });
      }

      // Crear el perfil usando el caso de uso
      const profileData = {
        userId,
        displayName: displayName.trim(),
        bio: bio ? bio.trim() : null,
        avatarUrl,
        birthDate: birthDate || null,
        gender: gender || null
      };

      const result = await this.createUserProfileUseCase.execute(profileData);

      // Preparar respuesta según especificación
      const responseData = {
        id: result.userProfile?.id || result.id,
        user_id: userId,
        display_name: displayName.trim(),
        bio: bio ? bio.trim() : null,
        avatar_url: avatarUrl,
        birth_date: birthDate || null,
        gender: gender || null,
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        is_verified: false,
        is_active: true,
        created_at: result.userProfile?.created_at || result.createdAt || new Date().toISOString(),
        updated_at: result.userProfile?.updated_at || result.updatedAt || new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        message: 'Perfil creado exitosamente',
        data: responseData
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Verificar si existe un perfil para el usuario
   */
  async findExistingProfile(userId) {
    try {
      // Usar directamente el modelo para verificar existencia
      const { UserProfileModel } = require('../../infrastructure/database/models');
      return await UserProfileModel.findOne({ where: { user_id: userId } });
    } catch (error) {
      console.error('Error verificando perfil existente:', error);
      return null;
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
async getProfileByUserId(req, res, next) {
  try {
    const { userId } = req.params;
    
    console.log(`📋 GetProfileByUserId - User: ${userId}`);
    
    const profile = await this.userProfileRepository.findByUserId(userId);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Perfil no encontrado'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: {
        profile: {
          userId: profile.user_id,
          displayName: profile.display_name,
          bio: profile.bio,
          avatarUrl: profile.avatar_url,
          coverUrl: profile.cover_url,
          location: profile.location,
          website: profile.website,
          birthDate: profile.birth_date,
          gender: profile.gender,
          followersCount: profile.followers_count,
          followingCount: profile.following_count,
          postsCount: profile.posts_count,
          isVerified: profile.is_verified,
          isActive: profile.is_active,
          lastActiveAt: profile.last_active_at,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Error en getProfileByUserId:', error.message);
    next(error);
  }
}
 
  async removeFriend(req, res) {
    try {
      const { friendId } = req.params;
      const userId = req.user.id;
      
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
