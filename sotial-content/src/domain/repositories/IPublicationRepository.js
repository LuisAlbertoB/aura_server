/**
 * Interface del repositorio para Publication
 * Define el contrato que debe implementar la capa de infraestructura
 */
class IPublicationRepository {
  /**
   * Buscar una publicación por ID
   * @param {string} publicationId - ID de la publicación
   * @returns {Promise<Publication|null>}
   */
  async findById(publicationId) {
    throw new Error('Method findById must be implemented');
  }

  /**
   * Guardar una publicación (crear o actualizar)
   * @param {Publication} publication - Agregado Publication
   * @returns {Promise<Publication>}
   */
  async save(publication) {
    throw new Error('Method save must be implemented');
  }

  /**
   * Eliminar una publicación
   * @param {string} publicationId - ID de la publicación
   * @returns {Promise<void>}
   */
  async delete(publicationId) {
    throw new Error('Method delete must be implemented');
  }

  /**
   * Verificar si existe una publicación
   * @param {string} publicationId - ID de la publicación
   * @returns {Promise<boolean>}
   */
  async exists(publicationId) {
    throw new Error('Method exists must be implemented');
  }

  /**
   * Obtener publicaciones por autor
   * @param {string} authorId - ID del autor
   * @param {Object} options - Opciones de paginación y filtros
   * @returns {Promise<{publications: Publication[], total: number}>}
   */
  async findByAuthor(authorId, options = {}) {
    throw new Error('Method findByAuthor must be implemented');
  }

  /**
   * Obtener feed de publicaciones para un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones de paginación y filtros
   * @returns {Promise<{publications: Publication[], total: number}>}
   */
  async getFeedForUser(userId, options = {}) {
    throw new Error('Method getFeedForUser must be implemented');
  }

  /**
   * Buscar publicaciones por criterios
   * @param {Object} criteria - Criterios de búsqueda
   * @param {Object} options - Opciones de paginación y ordenamiento
   * @returns {Promise<{publications: Publication[], total: number}>}
   */
  async findByCriteria(criteria, options = {}) {
    throw new Error('Method findByCriteria must be implemented');
  }

  /**
   * Buscar publicaciones por contenido de texto
   * @param {string} searchText - Texto a buscar
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<{publications: Publication[], total: number}>}
   */
  async searchByText(searchText, options = {}) {
    throw new Error('Method searchByText must be implemented');
  }

  /**
   * Obtener publicaciones populares (más likes)
   * @param {Object} options - Opciones de paginación y período de tiempo
   * @returns {Promise<{publications: Publication[], total: number}>}
   */
  async getPopularPublications(options = {}) {
    throw new Error('Method getPopularPublications must be implemented');
  }

  /**
   * Obtener publicaciones recientes
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<{publications: Publication[], total: number}>}
   */
  async getRecentPublications(options = {}) {
    throw new Error('Method getRecentPublications must be implemented');
  }

  /**
   * Obtener publicaciones que le gustaron a un usuario
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<{publications: Publication[], total: number}>}
   */
  async getLikedByUser(userId, options = {}) {
    throw new Error('Method getLikedByUser must be implemented');
  }

  /**
   * Obtener comentarios de una publicación
   * @param {string} publicationId - ID de la publicación
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<{comments: Comment[], total: number}>}
   */
  async getComments(publicationId, options = {}) {
    throw new Error('Method getComments must be implemented');
  }

  /**
   * Obtener respuestas a un comentario
   * @param {string} commentId - ID del comentario
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<{comments: Comment[], total: number}>}
   */
  async getCommentReplies(commentId, options = {}) {
    throw new Error('Method getCommentReplies must be implemented');
  }

  /**
   * Obtener usuarios que dieron like a una publicación
   * @param {string} publicationId - ID de la publicación
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<{userIds: string[], total: number}>}
   */
  async getLikes(publicationId, options = {}) {
    throw new Error('Method getLikes must be implemented');
  }

  /**
   * Verificar si un usuario dio like a una publicación
   * @param {string} publicationId - ID de la publicación
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>}
   */
  async hasUserLiked(publicationId, userId) {
    throw new Error('Method hasUserLiked must be implemented');
  }

  /**
   * Obtener estadísticas de una publicación
   * @param {string} publicationId - ID de la publicación
   * @returns {Promise<Object>}
   */
  async getPublicationStats(publicationId) {
    throw new Error('Method getPublicationStats must be implemented');
  }

  /**
   * Obtener estadísticas del autor
   * @param {string} authorId - ID del autor
   * @returns {Promise<Object>}
   */
  async getAuthorStats(authorId) {
    throw new Error('Method getAuthorStats must be implemented');
  }

  /**
   * Obtener el timeline de un usuario (sus publicaciones y de sus amigos)
   * @param {string} userId - ID del usuario
   * @param {string[]} friendIds - IDs de los amigos
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<{publications: Publication[], total: number}>}
   */
  async getTimeline(userId, friendIds, options = {}) {
    throw new Error('Method getTimeline must be implemented');
  }
}

module.exports = IPublicationRepository;