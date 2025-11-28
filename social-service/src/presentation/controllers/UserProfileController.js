// ✅ AÑADE ESTO AL PRINCIPIO DEL ARCHIVO
const fs = require('fs');

class UserProfileController {
  constructor(
    createUserProfileUseCase,
    updateProfileUseCase,
    updateInterestsUseCase,
    addFriendUseCase,
    removeFriendUseCase,
    blockUserUseCase,
    unblockUserUseCase,
    userProfileRepository,
      cloudinaryService
  ) {
    this.createUserProfileUseCase = createUserProfileUseCase;
    this.updateProfileUseCase = updateProfileUseCase;
    this.updateInterestsUseCase = updateInterestsUseCase;
    this.addFriendUseCase = addFriendUseCase;
    this.removeFriendUseCase = removeFriendUseCase;
    this.blockUserUseCase = blockUserUseCase;
    this.unblockUserUseCase = unblockUserUseCase;
    this.userProfileRepository = userProfileRepository;
     this.cloudinaryService = cloudinaryService;

    this.createProfile = this.createProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.updateInterests = this.updateInterests.bind(this);
    this.addFriend = this.addFriend.bind(this);
    this.removeFriend = this.removeFriend.bind(this);
    this.blockUser = this.blockUser.bind(this);
    this.unblockUser = this.unblockUser.bind(this);
    this.getProfileByUserId = this.getProfileByUserId.bind(this);
  }

  async createProfile(req, res) {
  try {
    console.log('📝 CreateProfile - Datos recibidos:', {
      body: req.body,
      file: req.file ? { filename: req.file.filename, path: req.file.path, mimetype: req.file.mimetype } : null,
      avatarUrl: req.avatarUrl,
      user: req.user?.id,
      contentType: req.headers['content-type']
    });

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const userId = req.user.id;
    const { displayName, bio, birthDate, gender, avatar } = req.body;
    
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

    // ✅ PROCESAMIENTO DEL AVATAR
    let avatarUrl = req.avatarUrl || avatar || null;

    // Si hay archivo subido, procesarlo con Cloudinary
    if (req.file) {
      try {
        console.log('📤 Subiendo avatar a Cloudinary...');
        
        // ✅ SOLUCIÓN - Pasar el objeto file completo
        const uploadResult = await this.cloudinaryService.upload(req.file, {
          folder: 'profiles/avatars',
          public_id: `profile-${userId}-${Date.now()}`,
          transformation: [
            { width: 200, height: 200, crop: 'fill' },
            { quality: 'auto' },
            { format: 'jpg' }
          ]
        });
        
        avatarUrl = uploadResult.secureUrl;
        console.log('✅ Avatar subido a Cloudinary:', avatarUrl);
        
        // ✅ CORREGIDO - fs ya está importado al principio
        fs.unlinkSync(req.file.path);
        console.log('🗑️ Archivo temporal eliminado');
        
      } catch (uploadError) {
        console.error('❌ Error subiendo avatar a Cloudinary:', uploadError);
        // Si falla la subida, limpiar el archivo temporal
        try {
          // ✅ CORREGIDO - Ya no necesitas require aquí
          if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
          }
        } catch (cleanupError) {
          console.error('❌ Error limpiando archivo temporal:', cleanupError);
        }
        
        return res.status(500).json({
          success: false,
          message: 'Error al procesar la imagen del avatar'
        });
      }
    }

    // Validar que se proporcionó avatar
    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        message: 'El avatar es obligatorio'
      });
    }

    console.log('📝 CreateProfile - Procesando datos:', {
      userId,
      displayName,
      bio,
      birthDate,
      gender,
      avatarUrl
    });

    const existingProfile = await this.findExistingProfile(userId);
    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un perfil para este usuario'
      });
    }

    const profileData = {
      userId,
      displayName: displayName.trim(),
      bio: bio ? bio.trim() : null,
      avatarUrl,
      birthDate: birthDate || null,
      gender: gender || null
    };

    const result = await this.createUserProfileUseCase.execute(profileData);

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

  async findExistingProfile(userId) {
    try {
      const { UserProfileModel } = require('../../infrastructure/database/models');
      return await UserProfileModel.findOne({ where: { user_id: userId } });
    } catch (error) {
      console.error('Error verificando perfil existente:', error);
      return null;
    }
  }

  async getProfileByUserId(req, res) {
    try {
      const { userId } = req.params;
      
      console.log(`📋 GetProfileByUserId - Buscando perfil para: ${userId}`);
      
      const profile = await this.userProfileRepository.findByUserId(userId);
      
      if (!profile) {
        console.log(`⚠️ Perfil no encontrado para userId: ${userId}`);
        return res.status(404).json({
          success: false,
          message: 'Perfil no encontrado'
        });
      }
      
      console.log(`✅ Perfil encontrado:`, {
        id: profile.id,
        user_id: profile.user_id,
        display_name: profile.display_name
      });
      
      return res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: {
          profile: {
            id: profile.id,
            userId: profile.user_id,
            displayName: profile.display_name,
            bio: profile.bio,
            avatarUrl: profile.avatar_url,
            coverUrl: profile.cover_url,
            location: profile.location,
            website: profile.website,
            birthDate: profile.birth_date,
            gender: profile.gender,
            privacySettings: profile.privacy_settings,
            preferences: profile.preferences,
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
      console.error('❌ Error en getProfileByUserId:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener perfil',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { username, email, fullName, bio, avatarUrl, location, website, birthDate } = req.body;
      const userId = req.user.id;

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

  async addFriend(req, res) {
    try {
      console.log('👥 AddFriend controller - params:', req.params);
      console.log('👥 AddFriend controller - body:', req.body);
      
      const userId = req.user.id;
      const { friendId } = req.body;
      
      if (!friendId) {
        return res.status(400).json({
          success: false,
          message: 'friendId es requerido en el cuerpo de la petición'
        });
      }
      
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

  async blockUser(req, res) {
    try {
      console.log('🚫 BlockUser controller - params:', req.params);
      console.log('🚫 BlockUser controller - body:', req.body);
      
      const userId = req.user.id;
      const { userIdToBlock } = req.body;
      
      if (!userIdToBlock) {
        return res.status(400).json({
          success: false,
          message: 'userIdToBlock es requerido en el cuerpo de la petición'
        });
      }
      
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

  _verifyOwnership(requestUserId, resourceUserId) {
    if (requestUserId !== resourceUserId) {
      throw new Error('No tienes permisos para realizar esta acción');
    }
  }

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