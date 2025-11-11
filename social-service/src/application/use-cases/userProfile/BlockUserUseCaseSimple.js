
class BlockUserUseCase {
  constructor(userProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  /**
   * Bloquear un usuario
   */
  async execute(userId, blockedUserId) {
    try {
      console.log('🚫 BlockUserUseCase - userId:', userId, 'blockedUserId:', blockedUserId);

      // 1. Validaciones básicas
      if (!userId || !blockedUserId) {
        throw new Error('User ID y Blocked User ID son requeridos');
      }

      if (userId === blockedUserId) {
        throw new Error('No puedes bloquearte a ti mismo');
      }

      // 2. Obtener el perfil del usuario
      const userProfile = await this.userProfileRepository.findByUserId(userId);
      
      if (!userProfile) {
        throw new Error('Tu perfil de usuario no fue encontrado. Crea un perfil primero.');
      }

      // 3. Obtener listas actuales
      const currentPreferences = userProfile.preferences || {};
      const currentBlockedUsers = currentPreferences.blockedUsers || [];
      const currentFriends = currentPreferences.friends || [];

      // 4. Verificar si ya está bloqueado
      if (currentBlockedUsers.includes(blockedUserId)) {
        throw new Error('Este usuario ya está bloqueado');
      }

      // 5. Agregar a lista de bloqueados
      const newBlockedUsers = [...currentBlockedUsers, blockedUserId];

      // 6. Remover de amigos si está ahí
      const newFriends = currentFriends.filter(id => id !== blockedUserId);

      // 7. Actualizar preferences
      const updateData = {
        preferences: {
          ...currentPreferences,
          blockedUsers: newBlockedUsers,
          friends: newFriends
        }
      };

      // 8. Guardar cambios
      const updatedProfile = await this.userProfileRepository.update(userProfile.id, updateData);

      console.log('✅ Usuario bloqueado exitosamente');

      // 9. Retornar resultado
      return {
        success: true,
        message: 'Usuario bloqueado exitosamente',
        block: {
          userId: userId,
          blockedUserId: blockedUserId,
          timestamp: new Date().toISOString(),
          removedFromFriends: currentFriends.includes(blockedUserId)
        },
        userProfile: {
          id: updatedProfile.id,
          userId: updatedProfile.user_id,
          displayName: updatedProfile.display_name,
          blockedUsersCount: newBlockedUsers.length,
          friendsCount: newFriends.length
        }
      };

    } catch (error) {
      console.error('❌ Error en BlockUserUseCase:', error);
      throw new Error(`Error al bloquear usuario: ${error.message}`);
    }
  }
}

class UnblockUserUseCase {
  constructor(userProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  /**
   * Desbloquear un usuario
   */
  async execute(userId, unblockedUserId) {
    try {
      console.log('✅ UnblockUserUseCase - userId:', userId, 'unblockedUserId:', unblockedUserId);

      // 1. Validaciones básicas
      if (!userId || !unblockedUserId) {
        throw new Error('User ID y Unblocked User ID son requeridos');
      }

      // 2. Obtener el perfil del usuario
      const userProfile = await this.userProfileRepository.findByUserId(userId);
      
      if (!userProfile) {
        throw new Error('Tu perfil de usuario no fue encontrado');
      }

      // 3. Obtener lista actual de bloqueados
      const currentPreferences = userProfile.preferences || {};
      const currentBlockedUsers = currentPreferences.blockedUsers || [];

      // 4. Verificar si está bloqueado
      if (!currentBlockedUsers.includes(unblockedUserId)) {
        throw new Error('Este usuario no está bloqueado');
      }

      // 5. Remover de lista de bloqueados
      const newBlockedUsers = currentBlockedUsers.filter(id => id !== unblockedUserId);

      // 6. Actualizar preferences
      const updateData = {
        preferences: {
          ...currentPreferences,
          blockedUsers: newBlockedUsers
        }
      };

      // 7. Guardar cambios
      const updatedProfile = await this.userProfileRepository.update(userProfile.id, updateData);

      console.log('✅ Usuario desbloqueado exitosamente');

      // 8. Retornar resultado
      return {
        success: true,
        message: 'Usuario desbloqueado exitosamente',
        userProfile: {
          id: updatedProfile.id,
          userId: updatedProfile.user_id,
          displayName: updatedProfile.display_name,
          blockedUsersCount: newBlockedUsers.length
        }
      };

    } catch (error) {
      console.error('❌ Error en UnblockUserUseCase:', error);
      throw new Error(`Error al desbloquear usuario: ${error.message}`);
    }
  }
}

module.exports = {
  BlockUserUseCase,
  UnblockUserUseCase
};