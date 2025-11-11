

class AddFriendUseCase {
  constructor(userProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  /**
   * Agregar un amigo al perfil del usuario
   */
  async execute(userId, friendId) {
    try {
      console.log('👥 AddFriendUseCase - userId:', userId, 'friendId:', friendId);

      // 1. Validaciones básicas
      if (!userId || !friendId) {
        throw new Error('User ID y Friend ID son requeridos');
      }

      if (userId === friendId) {
        throw new Error('No puedes agregarte a ti mismo como amigo');
      }

      // 2. Obtener el perfil del usuario por user_id
      const userProfile = await this.userProfileRepository.findByUserId(userId);
      
      if (!userProfile) {
        throw new Error('Tu perfil de usuario no fue encontrado. Crea un perfil primero.');
      }

      // 3. Verificar que el amigo existe (opcional - podemos agregar sin verificar)
      const friendProfile = await this.userProfileRepository.findByUserId(friendId);
      
      if (!friendProfile) {
        console.log('⚠️ Agregando amigo que no tiene perfil aún:', friendId);
      }

      // 4. Obtener lista actual de amigos
      const currentPreferences = userProfile.preferences || {};
      const currentFriends = currentPreferences.friends || [];

      // 5. Verificar si ya es amigo
      if (currentFriends.includes(friendId)) {
        throw new Error('Este usuario ya es tu amigo');
      }

      // 6. Agregar amigo a la lista
      const newFriends = [...currentFriends, friendId];

      // 7. Actualizar preferences
      const updateData = {
        preferences: {
          ...currentPreferences,
          friends: newFriends
        }
      };

      // 8. Guardar cambios
      const updatedProfile = await this.userProfileRepository.update(userProfile.id, updateData);

      console.log('✅ Amigo agregado exitosamente');

      // 9. Retornar resultado
      return {
        success: true,
        message: 'Amigo agregado exitosamente',
        friendship: {
          userId: userId,
          friendId: friendId,
          friendDisplayName: friendProfile?.display_name || friendId,
          timestamp: new Date().toISOString()
        },
        userProfile: {
          id: updatedProfile.id,
          userId: updatedProfile.user_id,
          displayName: updatedProfile.display_name,
          friendsCount: newFriends.length,
          friends: newFriends
        }
      };

    } catch (error) {
      console.error('❌ Error en AddFriendUseCase:', error);
      throw new Error(`Error al agregar amigo: ${error.message}`);
    }
  }
}

class RemoveFriendUseCase {
  constructor(userProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  /**
   * Remover un amigo del perfil del usuario
   */
  async execute(userId, friendId) {
    try {
      console.log('👥 RemoveFriendUseCase - userId:', userId, 'friendId:', friendId);

      // 1. Validaciones básicas
      if (!userId || !friendId) {
        throw new Error('User ID y Friend ID son requeridos');
      }

      // 2. Obtener el perfil del usuario
      const userProfile = await this.userProfileRepository.findByUserId(userId);
      
      if (!userProfile) {
        throw new Error('Tu perfil de usuario no fue encontrado');
      }

      // 3. Obtener lista actual de amigos
      const currentPreferences = userProfile.preferences || {};
      const currentFriends = currentPreferences.friends || [];

      // 4. Verificar si es amigo
      if (!currentFriends.includes(friendId)) {
        throw new Error('Este usuario no está en tu lista de amigos');
      }

      // 5. Remover amigo de la lista
      const newFriends = currentFriends.filter(id => id !== friendId);

      // 6. Actualizar preferences
      const updateData = {
        preferences: {
          ...currentPreferences,
          friends: newFriends
        }
      };

      // 7. Guardar cambios
      const updatedProfile = await this.userProfileRepository.update(userProfile.id, updateData);

      console.log('✅ Amigo removido exitosamente');

      // 8. Retornar resultado
      return {
        success: true,
        message: 'Amigo removido exitosamente',
        userProfile: {
          id: updatedProfile.id,
          userId: updatedProfile.user_id,
          displayName: updatedProfile.display_name,
          friendsCount: newFriends.length,
          friends: newFriends
        }
      };

    } catch (error) {
      console.error('❌ Error en RemoveFriendUseCase:', error);
      throw new Error(`Error al remover amigo: ${error.message}`);
    }
  }
}

module.exports = {
  AddFriendUseCase,
  RemoveFriendUseCase
};