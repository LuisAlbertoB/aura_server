/**
 * Interface del repositorio para UserProfile
 * Define el contrato que debe implementar la capa de infraestructura
 * Esta es la frontera entre el dominio y la infraestructura
 */
class IUserProfileRepository {
  /**
   * Buscar un perfil por ID
   * @param {string} userId - ID del usuario
   * @returns {Promise<UserProfile|null>}
   */
  async findById(userId) {
    throw new Error('Method findById must be implemented');
  }

  /**
   * Buscar un perfil por username
   * @param {string} username - Username del usuario
   * @returns {Promise<UserProfile|null>}
   */
  async findByUsername(username) {
    throw new Error('Method findByUsername must be implemented');
  }

  /**
   * Guardar un perfil (crear o actualizar)
   * @param {UserProfile} userProfile - Agregado UserProfile
   * @returns {Promise<UserProfile>}
   */
  async save(userProfile) {
    throw new Error('Method save must be implemented');
  }

  /**
   * Eliminar un perfil
   * @param {string} userId - ID del usuario
   * @returns {Promise<void>}
   */
  async delete(userId) {
    throw new Error('Method delete must be implemented');
  }

  /**
   * Verificar si existe un perfil
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>}
   */
  async exists(userId) {
    throw new Error('Method exists must be implemented');
  }

  /**
   * Verificar si un username está disponible
   * @param {string} username - Username a verificar
   * @param {string} excludeUserId - ID del usuario a excluir de la búsqueda (para actualizaciones)
   * @returns {Promise<boolean>}
   */
  async isUsernameAvailable(username, excludeUserId = null) {
    throw new Error('Method isUsernameAvailable must be implemented');
  }

  /**
   * Obtener los amigos de un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<{friends: UserProfile[], total: number}>}
   */
  async getFriends(userId, options = {}) {
    throw new Error('Method getFriends must be implemented');
  }

  /**
   * Obtener usuarios bloqueados
   * @param {string} userId - ID del usuario
   * @returns {Promise<UserProfile[]>}
   */
  async getBlockedUsers(userId) {
    throw new Error('Method getBlockedUsers must be implemented');
  }

  /**
   * Buscar perfiles por criterios
   * @param {Object} criteria - Criterios de búsqueda
   * @param {Object} options - Opciones de paginación y ordenamiento
   * @returns {Promise<{profiles: UserProfile[], total: number}>}
   */
  async findByCriteria(criteria, options = {}) {
    throw new Error('Method findByCriteria must be implemented');
  }

  /**
   * Obtener sugerencias de amigos para un usuario
   * @param {string} userId - ID del usuario
   * @param {number} limit - Límite de sugerencias
   * @returns {Promise<UserProfile[]>}
   */
  async getFriendSuggestions(userId, limit = 10) {
    throw new Error('Method getFriendSuggestions must be implemented');
  }

  /**
   * Obtener estadísticas del perfil
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>}
   */
  async getProfileStats(userId) {
    throw new Error('Method getProfileStats must be implemented');
  }
}

module.exports = IUserProfileRepository;