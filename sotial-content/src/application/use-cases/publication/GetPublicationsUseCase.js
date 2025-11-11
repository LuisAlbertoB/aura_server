
class GetPublicationsUseCase {
  constructor(publicationRepository) {
    this.publicationRepository = publicationRepository;
  }

  /**
   * Ejecutar caso de uso
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>}
   */
  async execute(options = {}) {
    try {
      console.log('📖 GetPublicationsUseCase - Opciones:', options);

      // VERSIÓN SIMPLIFICADA - Query directo con Sequelize
      const { PublicationModel } = require('../../../infrastructure/database/models');
      
      const {
        page = 1,
        limit = 10,
        userId = null,
        visibility = 'public'
      } = options;

      const offset = (page - 1) * limit;

      // Construir filtros
      const where = {
        is_active: true
      };

      if (userId) {
        where.user_id = userId;
      }

      if (visibility !== 'all') {
        where.visibility = visibility;
      }

      console.log('🔍 Query filters:', where);

      // Ejecutar consulta
      const result = await PublicationModel.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: [
          'id', 'user_id', 'content', 'type', 'visibility',
          'likes_count', 'comments_count', 'shares_count',
          'metadata', 'created_at', 'updated_at'
        ]
      });

      const publications = result.rows.map(pub => ({
        id: pub.id,
        user_id: pub.user_id,
        content: pub.content,
        type: pub.type,
        visibility: pub.visibility,
        likes_count: pub.likes_count,
        comments_count: pub.comments_count,
        shares_count: pub.shares_count,
        metadata: pub.metadata,
        created_at: pub.created_at,
        updated_at: pub.updated_at
      }));

      console.log(`✅ Encontradas ${result.count} publicaciones`);

      return {
        publications,
        pagination: {
          total: result.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(result.count / limit)
        }
      };

    } catch (error) {
      console.error('❌ Error en GetPublicationsUseCase:', error);
      throw new Error(`Error al obtener publicaciones: ${error.message}`);
    }
  }
}

module.exports = GetPublicationsUseCase;