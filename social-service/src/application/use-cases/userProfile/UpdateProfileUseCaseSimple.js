
class UpdateProfileUseCase {
  constructor(userProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  /**
   * Actualizar información del perfil de usuario
   */
  async execute(userId, updateData) {
    try {
      console.log('📝 UpdateProfileUseCase - userId:', userId, 'data:', updateData);

      // 1. Validaciones básicas
      if (!userId) {
        throw new Error('userId es requerido');
      }

      // 2. Obtener el perfil actual por user_id
      const userProfile = await this.userProfileRepository.findByUserId(userId);
      
      if (!userProfile) {
        throw new Error('Perfil de usuario no encontrado');
      }

      // 3. Preparar datos para actualización
      const updateFields = {};
      
      if (updateData.email !== undefined) updateFields.email = updateData.email;
      if (updateData.username !== undefined) updateFields.display_name = updateData.username;
      if (updateData.fullName !== undefined) updateFields.display_name = updateData.fullName;
      if (updateData.displayName !== undefined) updateFields.display_name = updateData.displayName;
      if (updateData.bio !== undefined) updateFields.bio = updateData.bio;
      if (updateData.avatarUrl !== undefined) updateFields.avatar_url = updateData.avatarUrl;
      if (updateData.location !== undefined) updateFields.location = updateData.location;
      if (updateData.website !== undefined) updateFields.website = updateData.website;
      if (updateData.birthDate !== undefined) updateFields.birth_date = updateData.birthDate;
      if (updateData.gender !== undefined) updateFields.gender = updateData.gender;

      // Actualizar preferencias si se proporcionan intereses
      if (updateData.interests !== undefined) {
        const currentPreferences = userProfile.preferences || {};
        updateFields.preferences = {
          ...currentPreferences,
          interests: updateData.interests
        };
      }

      // 4. Actualizar perfil
      const updatedProfile = await this.userProfileRepository.update(userProfile.id, updateFields);

      console.log('✅ Perfil actualizado exitosamente:', updatedProfile.id);

      // 5. Retornar resultado
      return {
        success: true,
        userProfile: {
          id: updatedProfile.id,
          userId: updatedProfile.user_id,
          displayName: updatedProfile.display_name,
          bio: updatedProfile.bio,
          avatarUrl: updatedProfile.avatar_url,
          location: updatedProfile.location,
          website: updatedProfile.website,
          birthDate: updatedProfile.birth_date,
          gender: updatedProfile.gender,
          preferences: updatedProfile.preferences,
          isVerified: updatedProfile.is_verified,
          isActive: updatedProfile.is_active,
          updatedAt: updatedProfile.updated_at
        }
      };

    } catch (error) {
      console.error('❌ Error en UpdateProfileUseCase:', error);
      throw new Error(`Error al actualizar perfil: ${error.message}`);
    }
  }
}

class UpdateInterestsUseCase {
  constructor(userProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  /**
   * Actualizar intereses del usuario
   */
  async execute(userId, newInterests) {
    try {
      console.log('📝 UpdateInterestsUseCase - userId:', userId, 'interests:', newInterests);

      // 1. Obtener el perfil
      const userProfile = await this.userProfileRepository.findByUserId(userId);
      
      if (!userProfile) {
        throw new Error('Perfil de usuario no encontrado');
      }

      // 2. Actualizar preferencias con nuevos intereses
      const currentPreferences = userProfile.preferences || {};
      const updateFields = {
        preferences: {
          ...currentPreferences,
          interests: newInterests || []
        }
      };

      // 3. Guardar cambios
      const updatedProfile = await this.userProfileRepository.update(userProfile.id, updateFields);

      console.log('✅ Intereses actualizados exitosamente');

      // 4. Retornar resultado
      return {
        success: true,
        userProfile: {
          id: updatedProfile.id,
          userId: updatedProfile.user_id,
          displayName: updatedProfile.display_name,
          preferences: updatedProfile.preferences,
          updatedAt: updatedProfile.updated_at
        }
      };

    } catch (error) {
      console.error('❌ Error en UpdateInterestsUseCase:', error);
      throw new Error(`Error al actualizar intereses: ${error.message}`);
    }
  }
}

module.exports = {
  UpdateProfileUseCase,
  UpdateInterestsUseCase
};