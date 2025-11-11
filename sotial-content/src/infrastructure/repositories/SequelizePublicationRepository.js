const { v4: uuidv4 } = require('uuid');
const IPublicationRepository = require('../../domain/repositories/IPublicationRepository');
const Publication = require('../../domain/aggregates/Publication/Publication');
const Comment = require('../../domain/aggregates/Publication/entities/Comment');
const MediaItem = require('../../domain/aggregates/Publication/entities/MediaItem');
const { 
  PublicationModel, 
  CommentModel, 
  LikeModel, 
  MediaItemModel, 
  UserProfileModel 
} = require('../database/models');
const { Op } = require('sequelize');

/**
 * Implementación del repositorio de Publication usando Sequelize
 * Este es el "adaptador" entre nuestro dominio y la base de datos
 */
class SequelizePublicationRepository extends IPublicationRepository {
  
  /**
   * Buscar una publicación por ID
   */
  async findById(publicationId) {
    try {
      const publicationData = await PublicationModel.findByPk(publicationId, {
        include: [
          {
            model: CommentModel,
            as: 'comments',
            where: { is_active: true },
            required: false,
            order: [['created_at', 'DESC']]
          },
          {
            model: MediaItemModel,
            as: 'mediaItems',
            order: [['order_position', 'ASC']]
          },
          {
            model: LikeModel,
            as: 'likes'
          }
        ]
      });

      if (!publicationData) {
        return null;
      }

      return this._mapToAggregate(publicationData);
    } catch (error) {
      throw new Error(`Error al buscar publicación: ${error.message}`);
    }
  }

  /**
   * Guardar una publicación (crear o actualizar)
   */
  async save(publication) {
    const transaction = await PublicationModel.sequelize.transaction();
    
    try {
      // Buscar si ya existe
      const existingPublication = await PublicationModel.findByPk(
        publication.id.value, 
        { transaction }
      );

      let publicationData;
      
      if (existingPublication) {
        // Actualizar publicación existente
        await existingPublication.update({
          content: publication.text.text,
          type: publication.type,
          visibility: publication.visibility,
          is_active: publication.status === 'published',
          likes_count: publication.likesCount,
          comments_count: publication.commentsCount,
          updated_at: publication.updatedAt
        }, { transaction });
        
        publicationData = existingPublication;
      } else {
        // Crear nueva publicación
        publicationData = await PublicationModel.create({
          id: publication.id.value,
          user_id: publication.authorId,
          content: publication.text.text,
          type: publication.type,
          visibility: publication.visibility,
          is_active: publication.status === 'published',
          likes_count: publication.likesCount,
          comments_count: publication.commentsCount,
          created_at: publication.createdAt,
          updated_at: publication.updatedAt
        }, { transaction });
      }

      // Guardar comentarios
      await this._saveComments(publication, transaction);
      
      // Guardar likes
      await this._saveLikes(publication, transaction);
      
      // Guardar media items
      await this._saveMediaItems(publication, transaction);

      await transaction.commit();
      
      // Recargar con relaciones
      const savedPublication = await this.findById(publication.id.value);
      return savedPublication;
      
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al guardar publicación: ${error.message}`);
    }
  }

  /**
   * Eliminar una publicación
   */
  async delete(publicationId) {
    try {
      const publication = await PublicationModel.findByPk(publicationId);
      if (!publication) {
        throw new Error('Publicación no encontrada');
      }
      
      await publication.destroy();
    } catch (error) {
      throw new Error(`Error al eliminar publicación: ${error.message}`);
    }
  }

  /**
   * Verificar si existe una publicación
   */
  async exists(publicationId) {
    try {
      const count = await PublicationModel.count({
        where: { id: publicationId }
      });
      return count > 0;
    } catch (error) {
      throw new Error(`Error al verificar existencia: ${error.message}`);
    }
  }

  /**
   * Obtener publicaciones por autor
   */
  async findByAuthor(authorId, options = {}) {
    try {
      const { page = 1, limit = 10, status = 'published' } = options;
      const offset = (page - 1) * limit;

      const { count, rows } = await PublicationModel.findAndCountAll({
        where: { 
          user_id: authorId,
          is_active: true 
        },
        include: this._getIncludeOptions(),
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      const publications = rows.map(pub => this._mapToAggregate(pub));
      
      return {
        publications,
        total: count
      };
    } catch (error) {
      throw new Error(`Error al buscar por autor: ${error.message}`);
    }
  }

  /**
   * Obtener feed de publicaciones para un usuario
   */
  async getFeedForUser(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      // Obtener amigos del usuario
      const userProfile = await UserProfileModel.findByPk(userId);
      const friendIds = userProfile ? JSON.parse(userProfile.friends || '[]') : [];
      
      // Incluir publicaciones del usuario y de sus amigos
      const authorIds = [userId, ...friendIds];

      const { count, rows } = await PublicationModel.findAndCountAll({
        where: { 
          user_id: { [Op.in]: authorIds },
          is_active: true,
          visibility: { [Op.in]: ['public', 'friends'] }
        },
        include: this._getIncludeOptions(),
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      const publications = rows.map(pub => this._mapToAggregate(pub));
      
      return {
        publications,
        total: count
      };
    } catch (error) {
      throw new Error(`Error al obtener feed: ${error.message}`);
    }
  }

  /**
   * Buscar publicaciones por texto
   */
  async searchByText(searchText, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      const { count, rows } = await PublicationModel.findAndCountAll({
        where: {
          text: { [Op.like]: `%${searchText}%` },
          is_active: true,
          visibility: 'public'
        },
        include: this._getIncludeOptions(),
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      const publications = rows.map(pub => this._mapToAggregate(pub));
      
      return {
        publications,
        total: count
      };
    } catch (error) {
      throw new Error(`Error en búsqueda por texto: ${error.message}`);
    }
  }

  // Métodos auxiliares privados

  /**
   * Mapear de modelo Sequelize a agregado del dominio
   */
  _mapToAggregate(publicationData) {
    // Crear el agregado Publication
    const publication = new Publication(
      publicationData.id,
      publicationData.user_id,
      publicationData.content || '',
      publicationData.type
    );

    // Restaurar estado del agregado
    publication._status = publicationData.is_active ? 'published' : 'archived';
    publication._visibility = publicationData.visibility;
    publication._createdAt = publicationData.created_at;
    publication._updatedAt = publicationData.updated_at;

    // Mapear comentarios
    if (publicationData.comments) {
      publicationData.comments.forEach(commentData => {
        const comment = new Comment(
          commentData.id,
          commentData.user_id,
          commentData.content,
          publicationData.id,
          commentData.parent_id
        );
        
        // Restaurar estado del comentario
        comment._createdAt = commentData.created_at;
        comment._updatedAt = commentData.updated_at;
        comment._likesCount = commentData.likes_count;
        comment._isEdited = commentData.is_edited;
        comment._status = commentData.is_active ? 'active' : 'inactive';
        
        publication._comments.set(comment.id, comment);
      });
    }

    // Mapear likes
    if (publicationData.likes) {
      publicationData.likes.forEach(like => {
        publication._likes.add(like.user_id);
      });
    }

    // Mapear media items
    if (publicationData.mediaItems) {
      publicationData.mediaItems.forEach(mediaData => {
        const mediaItem = new MediaItem(
          mediaData.id,
          publicationData.id,
          mediaData.type,
          mediaData.url,
          mediaData.filename,
          mediaData.size,
          mediaData.order_position
        );
        
        // Restaurar estado del media item
        mediaItem._createdAt = mediaData.created_at;
        if (mediaData.cloudinary_public_id) {
          mediaItem._cloudinaryPublicId = mediaData.cloudinary_public_id;
        }
        if (mediaData.metadata) {
          mediaItem._metadata = mediaData.metadata;
        }
        
        publication._mediaItems.set(mediaItem.id, mediaItem);
      });
    }

    return publication;
  }

  /**
   * Opciones de include para las consultas
   */
  _getIncludeOptions() {
    return [
      {
        model: CommentModel,
        as: 'comments',
        where: { is_active: true },
        required: false,
        order: [['created_at', 'DESC']]
      },
      {
        model: MediaItemModel,
        as: 'mediaItems',
        order: [['order_position', 'ASC']]
      },
      {
        model: LikeModel,
        as: 'likes'
      }
    ];
  }

  /**
   * Guardar comentarios del agregado
   */
  async _saveComments(publication, transaction) {
    // Eliminar comentarios existentes que ya no están en el agregado
    await CommentModel.destroy({
      where: { post_id: publication.id.value },
      transaction
    });

    // Crear/actualizar comentarios del agregado
    for (const comment of publication.comments) {
      await CommentModel.upsert({
        id: comment.id,
        post_id: publication.id.value,
        user_id: comment.authorId,
        parent_id: comment.parentCommentId,
        content: comment.text,
        likes_count: comment.likesCount,
        is_active: comment.status === 'active',
        is_edited: comment.isEdited,
        created_at: comment.createdAt,
        updated_at: comment.updatedAt
      }, { transaction });
    }
  }

  /**
   * Guardar likes del agregado
   */
  async _saveLikes(publication, transaction) {
    // Eliminar likes existentes
    await LikeModel.destroy({
      where: { 
        likeable_id: publication.id.value,
        likeable_type: 'post'
      },
      transaction
    });

    // Crear likes del agregado
    const likePromises = Array.from(publication.likes).map(userId => {
      return LikeModel.create({
        id: uuidv4(),
        user_id: userId,
        likeable_id: publication.id.value,
        likeable_type: 'post',
        type: 'like'
      }, { transaction });
    });

    await Promise.all(likePromises);
  }

  /**
   * Guardar media items del agregado
   */
  async _saveMediaItems(publication, transaction) {
    // Eliminar media items existentes
    await MediaItemModel.destroy({
      where: { post_id: publication.id.value },
      transaction
    });

    // Crear media items del agregado
    for (const mediaItem of publication.mediaItems) {
      await MediaItemModel.create({
        id: mediaItem.id,
        post_id: publication.id.value,
        type: mediaItem.type,
        url: mediaItem.url,
        filename: mediaItem.filename,
        size: mediaItem.size,
        order_position: mediaItem.order,
        cloudinary_public_id: mediaItem.cloudinaryPublicId,
        width: mediaItem.metadata.width,
        height: mediaItem.metadata.height,
        duration: mediaItem.metadata.duration,
        format: mediaItem.metadata.format,
        metadata: mediaItem.metadata,
        created_at: mediaItem.createdAt
      }, { transaction });
    }
  }
}

module.exports = SequelizePublicationRepository;