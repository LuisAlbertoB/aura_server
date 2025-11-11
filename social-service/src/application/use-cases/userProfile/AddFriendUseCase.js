

class AddFriendUseCase {
  constructor(userProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  /**
   * Agregar un amigo al perfil del usuario
   */
  async execute(authenticatedUserId, { friendId }) {
    try {
      // 1. Validaciones básicas
      if (!authenticatedUserId || !friendId) {
        throw new Error('El ID del usuario autenticado y el ID del amigo son requeridos');
      }

      // 2. Obtener el perfil del usuario
      const userProfile = await this.userProfileRepository.findById(authenticatedUserId);
      
      if (!userProfile) {
        throw new Error('Perfil de usuario no encontrado');
      }

      // 3. Verificar que el amigo existe
      const friendProfile = await this.userProfileRepository.findById(friendId);
      
      if (!friendProfile) {
        throw new Error('El usuario que quieres agregar como amigo no existe');
      }

      // 4. Usar método del agregado (toda la lógica de negocio está ahí)
      const friendAddedEvent = userProfile.addFriend(friendId);
      
      // 5. Persistir cambios
      await this.userProfileRepository.save(userProfile);

      // 6. Retornar resultado
      return {
        success: true,
        event: friendAddedEvent,
        friendship: {
          userId: authenticatedUserId,
          friendId: friendId,
          friendUsername: friendProfile.username,
          timestamp: friendAddedEvent.timestamp
        },
        userProfile: {
          id: userProfile.id.value,
          friendsCount: userProfile.getFriendsCount()
        }
      };

    } catch (error) {
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
  async execute(authenticatedUserId, { friendId }) {
    try {
      // 1. Obtener el perfil del usuario
      const userProfile = await this.userProfileRepository.findById(authenticatedUserId);
      
      if (!userProfile) {
        throw new Error('Perfil de usuario no encontrado');
      }

      // 2. Usar método del agregado
      const friendRemovedEvent = userProfile.removeFriend(friendId);
      
      // 3. Persistir cambios
      await this.userProfileRepository.save(userProfile);

      // 4. Retornar resultado
      return {
        success: true,
        event: friendRemovedEvent,
        userProfile: {
          id: userProfile.id.value,
          friendsCount: userProfile.getFriendsCount()
        }
      };

    } catch (error) {
      throw new Error(`Error al remover amigo: ${error.message}`);
    }
  }
}

module.exports = {
  AddFriendUseCase,
  RemoveFriendUseCase
};

/**
 * FUNCIONALIDAD COMPLETAMENTE NUEVA:
 * 
 * ✨ NUEVA (AddFriendUseCase):
 * - ✅ Implementa addFriend del diagrama Social
 * - ✅ Lógica de negocio en el agregado UserProfile
 * - ✅ Validaciones: no agregar a sí mismo, no duplicados, no bloqueados
 * - ✅ Eventos de dominio para notificaciones
 * - ✅ Consistencia garantizada por el agregado
 * - ✅ Fácil de testear y extender
 * 
 * Esta funcionalidad NO EXISTÍA en el microservicio original.
 * Ahora puedes agregar endpoints como:
 * POST /api/v1/users/:userId/friends
 * DELETE /api/v1/users/:userId/friends/:friendId
 */