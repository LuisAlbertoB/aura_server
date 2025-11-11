
class GetPublicationByIdUseCase {
  constructor(publicationRepository) {
    this.publicationRepository = publicationRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {string} publicationId - ID de la publicación
   * @param {string} requesterId - ID del usuario que solicita (para validar permisos)
   * @returns {Promise<Object>}
   */
  async execute(publicationId, requesterId = null) {
    try {
      console.log('🔍 GetPublicationByIdUseCase - ID:', publicationId, 'Requester:', requesterId);

      // VERSIÓN SIMPLIFICADA - Query directo con Sequelize
      const { PublicationModel } = require('../../../infrastructure/database/models');
      
      if (!publicationId) {
        throw new Error('ID de publicación requerido');
      }

      // Buscar publicación
      const publication = await PublicationModel.findOne({
        where: {
          id: publicationId,
          is_active: true
        },
        attributes: [
          'id', 'user_id', 'content', 'type', 'visibility',
          'likes_count', 'comments_count', 'shares_count',
          'metadata', 'created_at', 'updated_at'
        ]
      });

      if (!publication) {
        throw new Error('Publicación no encontrada');
      }

      console.log('📄 Publicación encontrada:', publication.id);

      // Validar permisos de acceso
      if (publication.visibility === 'private' && 
          requesterId && 
          publication.user_id !== requesterId) {
        throw new Error('No tienes permisos para ver esta publicación');
      }

      // Formatear respuesta
      const result = {
        id: publication.id,
        user_id: publication.user_id,
        content: publication.content,
        type: publication.type,
        visibility: publication.visibility,
        likes_count: publication.likes_count,
        comments_count: publication.comments_count,
        shares_count: publication.shares_count,
        metadata: publication.metadata,
        created_at: publication.created_at,
        updated_at: publication.updated_at
      };

      console.log('✅ Publicación obtenida exitosamente');

      return result;

    } catch (error) {
      console.error('❌ Error en GetPublicationByIdUseCase:', error);
      throw new Error(`Error al obtener publicación: ${error.message}`);
    }
  }
}

module.exports = GetPublicationByIdUseCase;