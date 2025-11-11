

class UpdateProfileUseCase {
  constructor(userProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  /**
   * Actualizar información del perfil de usuario
   */
  async execute(userId, updateData) {
    try {
      // 1. Validaciones básicas
      if (!userId) {
        throw new Error('User ID es requerido');
      }

      // 2. Obtener el perfil actual
      const userProfile = await this.userProfileRepository.findById(userId);
      
      if (!userProfile) {
        throw new Error('Perfil de usuario no encontrado');
      }

      // 3. Validar username único si se está cambiando
      if (updateData.username && updateData.username !== userProfile.username) {
        const isUsernameAvailable = await this.userProfileRepository.isUsernameAvailable(
          updateData.username, 
          userId
        );
        
        if (!isUsernameAvailable) {
          throw new Error('El username ya está en uso');
        }
      }

      // 4. Usar método del agregado (validaciones de dominio incluidas)
      userProfile.updateProfile(updateData.username, updateData.bio);
      
      // 5. Persistir cambios
      const updatedProfile = await this.userProfileRepository.save(userProfile);

      // 6. Retornar resultado
      return {
        success: true,
        userProfile: {
          id: updatedProfile.id.value,
          username: updatedProfile.username,
          bio: updatedProfile.bio ? updatedProfile.bio.value : null,
          updatedAt: updatedProfile.updatedAt
        }
      };

    } catch (error) {
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
      // 1. Obtener el perfil
      const userProfile = await this.userProfileRepository.findById(userId);
      
      if (!userProfile) {
        throw new Error('Perfil de usuario no encontrado');
      }

      // 2. Usar método del agregado (validaciones incluidas)
      userProfile.updateInterests(newInterests);
      
      // 3. Persistir cambios
      const updatedProfile = await this.userProfileRepository.save(userProfile);

      // 4. Retornar resultado
      return {
        success: true,
        userProfile: {
          id: updatedProfile.id.value,
          interests: updatedProfile.interests.map(interest => interest.toJSON()),
          interestsCount: updatedProfile.getInterestsCount(),
          updatedAt: updatedProfile.updatedAt
        }
      };

    } catch (error) {
      throw new Error(`Error al actualizar intereses: ${error.message}`);
    }
  }
}

class CreateUserProfileUseCase {
  constructor(userProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  /**
   * Crear un nuevo perfil de usuario
   */
  async execute(userData) {
    try {
      const { id, username, bio = null, interests = [] } = userData;

      // 1. Validaciones
      if (!id || !username) {
        throw new Error('ID y username son requeridos');
      }

      // 2. Verificar que el usuario no existe
      const existingProfile = await this.userProfileRepository.findById(id);
      if (existingProfile) {
        throw new Error('El perfil de usuario ya existe');
      }

      // 3. Verificar username único
      const isUsernameAvailable = await this.userProfileRepository.isUsernameAvailable(username);
      if (!isUsernameAvailable) {
        throw new Error('El username ya está en uso');
      }

      // 4. Crear agregado UserProfile
      const UserProfile = require('../../../domain/aggregates/UserProfile/UserProfile');
      const userProfile = new UserProfile(id, username, bio);

      // 5. Agregar intereses si se proporcionan
      if (interests.length > 0) {
        userProfile.updateInterests(interests);
      }

      // 6. Persistir
      const savedProfile = await this.userProfileRepository.save(userProfile);

      // 7. Retornar resultado
      return {
        success: true,
        userProfile: savedProfile.toJSON()
      };

    } catch (error) {
      throw new Error(`Error al crear perfil: ${error.message}`);
    }
  }
}

module.exports = {
  UpdateProfileUseCase,
  UpdateInterestsUseCase,
  CreateUserProfileUseCase
};