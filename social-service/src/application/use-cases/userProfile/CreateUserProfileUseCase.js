
const { v4: uuidv4 } = require('uuid');

class CreateUserProfileUseCase {
  constructor(userProfileRepository = null) {
    this.userProfileRepository = userProfileRepository;
  }

  /**
   * Crear un nuevo perfil de usuario con soporte para upload
   */
  async execute(userData) {
    try {
      console.log('📝 CreateUserProfileUseCase - userData:', userData);

      const { 
        userId, 
        displayName,
        bio,
        avatarUrl,
        birthDate,
        gender
      } = userData;

      // 1. Validaciones básicas
      if (!userId) {
        throw new Error('userId es requerido');
      }

      if (!displayName) {
        throw new Error('displayName es requerido');
      }

      // avatarUrl is optional for JSON fallback (can be null)
      const finalAvatarUrl = avatarUrl || null;

      // 2. Importar modelo directamente si no hay repository
      const { UserProfileModel } = require('../../../infrastructure/database/models');

      // 3. Verificar que el usuario no existe
      const existingProfile = this.userProfileRepository 
        ? await this.userProfileRepository.findByUserId(userId)
        : await UserProfileModel.findOne({ where: { user_id: userId } });

      if (existingProfile) {
        throw new Error('Ya existe un perfil para este usuario');
      }

      // 4. Preparar datos para crear perfil
      const profileData = {
        id: uuidv4(),
        user_id: userId,
        display_name: displayName,
        bio: bio || null,
  avatar_url: finalAvatarUrl,
        birth_date: birthDate || null,
        gender: gender || null,
        // Campos con valores por defecto según especificación
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        is_verified: false,
        is_active: true,
        // Campos opcionales no requeridos para la especificación actual
        location: null,
        website: null,
        privacy_settings: null,
        preferences: null
      };

      // 5. Crear perfil
      const savedProfile = this.userProfileRepository 
        ? await this.userProfileRepository.create(profileData)
        : await UserProfileModel.create(profileData);

      console.log('✅ Perfil creado exitosamente:', savedProfile.id);

      // 6. Retornar resultado según especificación
      return {
        userProfile: {
          id: savedProfile.id,
          user_id: savedProfile.user_id,
          display_name: savedProfile.display_name,
          bio: savedProfile.bio,
          avatar_url: savedProfile.avatar_url,
          birth_date: savedProfile.birth_date,
          gender: savedProfile.gender,
          followers_count: savedProfile.followers_count,
          following_count: savedProfile.following_count,
          posts_count: savedProfile.posts_count,
          is_verified: savedProfile.is_verified,
          is_active: savedProfile.is_active,
          created_at: savedProfile.created_at,
          updated_at: savedProfile.updated_at
        }
      };

    } catch (error) {
      console.error('❌ Error en CreateUserProfileUseCase:', error);
      throw new Error(`Error al crear perfil: ${error.message}`);
    }
  }
}

module.exports = CreateUserProfileUseCase;