
const { v4: uuidv4 } = require('uuid');

class CreateUserProfileUseCase {
  constructor(userProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  /**
   * Crear un nuevo perfil de usuario
   */
  async execute(userData) {
    try {
      console.log('📝 CreateUserProfileUseCase - userData:', userData);

      const { 
        userId, 
        email,
        username,
        fullName,
        displayName,
        bio,
        avatarUrl,
        location,
        website,
        birthDate,
        gender,
        interests = []
      } = userData;

      // 1. Validaciones básicas
      if (!userId) {
        throw new Error('userId es requerido');
      }

      if (!displayName && !fullName && !username) {
        throw new Error('Se requiere al menos displayName, fullName o username');
      }

      // 2. Usar displayName en prioridad: fullName > username > email
      const finalDisplayName = displayName || fullName || username || email || `Usuario_${userId}`;

      // 3. Verificar que el usuario no existe
      const existingProfile = await this.userProfileRepository.findByUserId(userId);
      if (existingProfile) {
        throw new Error('El perfil de usuario ya existe');
      }

      // 4. Preparar datos para crear perfil
      const profileData = {
        id: uuidv4(),
        user_id: userId,
        display_name: finalDisplayName,
        bio: bio || null,
        avatar_url: avatarUrl || null,
        location: location || null,
        website: website || null,
        birth_date: birthDate || null,
        gender: gender || null,
        privacy_settings: {
          profile_visibility: 'public',
          show_email: false,
          show_birth_date: !!birthDate,
          allow_friend_requests: true
        },
        preferences: {
          interests: interests || [],
          language: 'es',
          theme: 'light'
        },
        is_verified: false,
        is_active: true
      };

      // 5. Crear perfil
      const savedProfile = await this.userProfileRepository.create(profileData);

      console.log('✅ Perfil creado exitosamente:', savedProfile.id);

      // 6. Retornar resultado
      return {
        success: true,
        profile: {
          id: savedProfile.id,
          userId: savedProfile.user_id,
          displayName: savedProfile.display_name,
          bio: savedProfile.bio,
          avatarUrl: savedProfile.avatar_url,
          location: savedProfile.location,
          website: savedProfile.website,
          birthDate: savedProfile.birth_date,
          isVerified: savedProfile.is_verified,
          isActive: savedProfile.is_active,
          createdAt: savedProfile.created_at
        }
      };

    } catch (error) {
      console.error('❌ Error en CreateUserProfileUseCase:', error);
      throw new Error(`Error al crear perfil: ${error.message}`);
    }
  }
}

module.exports = CreateUserProfileUseCase;