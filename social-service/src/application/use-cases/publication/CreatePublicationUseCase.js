
const Publication = require('../../../domain/aggregates/Publication/Publication');
const { v4: uuidv4 } = require('uuid');

class CreatePublicationUseCase {
  constructor(publicationRepository, cloudinaryService) {
    this.publicationRepository = publicationRepository;
    this.cloudinaryService = cloudinaryService;
  }

  /**
   * Ejecutar caso de uso - VERSIÓN SIMPLIFICADA PARA TESTING
   * @param {Object} data - DTO con datos de la publicación
   * @returns {Promise<Object>}
   */
  async execute(data) {
    try {
      console.log('🚀 CreatePublicationUseCase - Datos recibidos:', data);

      // VERSIÓN TEMPORAL SIMPLIFICADA - Inserción directa a BD
      const { PublicationModel } = require('../../../infrastructure/database/models');
      
      const publicationId = uuidv4();
      const publicationData = {
        id: publicationId,
        user_id: data.authorId,
        content: data.text || data.content || '',
        type: data.type || 'text',
        visibility: data.visibility || 'public',
        location: null,
        tags: null,
        metadata: data.mediaUrls ? JSON.stringify({ mediaUrls: data.mediaUrls }) : null,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        is_active: true
      };

      console.log('💾 Intentando insertar en BD:', publicationData);

      // Inserción directa usando Sequelize
      const result = await PublicationModel.create(publicationData);

      console.log('✅ Publicación creada exitosamente:', result.toJSON());

      return {
        id: result.id,
        user_id: result.user_id,
        content: result.content,
        type: result.type,
        visibility: result.visibility,
        created_at: result.created_at,
        toJSON: () => result.toJSON()
      };

    } catch (error) {
      console.error('❌ Error en CreatePublicationUseCase:', error);
      throw new Error(`Error al crear publicación: ${error.message}`);
    }
  }

  // Métodos privados para organizar la lógica

  async _validateBusinessRules(data) {
    // Validación: debe tener contenido o archivos
    if (!data.text && (!data.files || data.files.length === 0)) {
      throw new Error('La publicación debe tener contenido de texto o archivos multimedia');
    }

    // Validación: límite de archivos
    if (data.files && data.files.length > 10) {
      throw new Error('No se pueden subir más de 10 archivos por publicación');
    }

    // Otras validaciones de negocio específicas...
  }

  async _processMediaFiles(publication, files) {
    const uploadPromises = files.map(async (file, index) => {
      try {
        // Subir a Cloudinary usando el servicio
        const uploadResult = await this.cloudinaryService.upload(file, {
          folder: `publications/${publication.id.value}`,
          resourceType: file.mimetype.startsWith('video/') ? 'video' : 'image'
        });

        // Usar método del agregado para agregar media item
        const addMediaEvent = publication.addMediaItem(
          uploadResult.resourceType,
          uploadResult.secureUrl,
          file.originalname,
          file.size,
          index
        );

        // El agregado retorna eventos que podríamos usar para notificaciones
        // console.log('Media agregado:', addMediaEvent);

        return uploadResult;

      } catch (error) {
        throw new Error(`Error al procesar archivo ${file.originalname}: ${error.message}`);
      }
    });

    await Promise.all(uploadPromises);
  }
}

module.exports = CreatePublicationUseCase;
