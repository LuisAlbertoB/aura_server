
class BlockUserUseCase {
  constructor(userProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  /**
   * Bloquear un usuario
   */
  async execute(authenticatedUserId, { userIdToBlock }) {
    try {
      // 1. Validaciones básicas
      if (!authenticatedUserId || !userIdToBlock) {
        throw new Error('El ID del usuario autenticado y el ID del usuario a bloquear son requeridos');
      }

      // 2. Obtener el perfil del usuario
      const userProfile = await this.userProfileRepository.findById(authenticatedUserId);
      
      if (!userProfile) {
        throw new Error('Perfil de usuario no encontrado');
      }

      // 3. Verificar que el usuario a bloquear existe
      const userToBlockProfile = await this.userProfileRepository.findById(userIdToBlock);
      
      if (!userToBlockProfile) {
        throw new Error('El usuario que quieres bloquear no existe');
      }

      // 4. Usar método del agregado (lógica compleja está ahí)
      const userBlockedEvent = userProfile.blockUser(userIdToBlock);
      
      // 5. Persistir cambios
      await this.userProfileRepository.save(userProfile);

      // 6. Retornar resultado
      return {
        success: true,
        event: userBlockedEvent,
        blockedUser: {
          id: userIdToBlock,
          username: userToBlockProfile.username
        },
        userProfile: {
          id: userProfile.id.value,
          blockedUsersCount: userProfile.blockedUsers.length,
          friendsCount: userProfile.getFriendsCount() // Se actualiza si era amigo
        }
      };

    } catch (error) {
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
  async execute(authenticatedUserId, { userIdToUnblock }) {
    try {
      // 1. Obtener el perfil del usuario
      const userProfile = await this.userProfileRepository.findById(authenticatedUserId);
      
      if (!userProfile) {
        throw new Error('Perfil de usuario no encontrado');
      }

      // 2. Usar método del agregado
      const userUnblockedEvent = userProfile.unblockUser(userIdToUnblock);
      
      // 3. Persistir cambios
      await this.userProfileRepository.save(userProfile);

      // 4. Retornar resultado
      return {
        success: true,
        event: userUnblockedEvent,
        userProfile: {
          id: userProfile.id.value,
          blockedUsersCount: userProfile.blockedUsers.length
        }
      };

    } catch (error) {
      throw new Error(`Error al desbloquear usuario: ${error.message}`);
    }
  }
}

module.exports = {
  BlockUserUseCase,
  UnblockUserUseCase
};

/**
 * FUNCIONALIDAD COMPLETAMENTE NUEVA:
 * 
 * ✨ NUEVA (BlockUserUseCase):
 * - ✅ Implementa blockUser del diagrama Social
 * - ✅ Lógica compleja: si era amigo, lo remueve automáticamente
 * - ✅ Previene bloquear a sí mismo
 * - ✅ Previene bloqueos duplicados
 * - ✅ Eventos de dominio para auditoría
 * - ✅ Estado consistente garantizado por el agregado
 * 
 * Esta funcionalidad permite crear endpoints como:
 * POST /api/v1/users/:userId/blocked-users
 * DELETE /api/v1/users/:userId/blocked-users/:blockedUserId
 * GET /api/v1/users/:userId/blocked-users
 */