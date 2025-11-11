
class PublicationController {
  constructor(
    createPublicationUseCase,
    getPublicationsUseCase,
    getPublicationByIdUseCase,
    likePublicationUseCase,
    unlikePublicationUseCase,
    addCommentUseCase,
    deleteCommentUseCase,
    getCommentsUseCase
  ) {
    this.createPublicationUseCase = createPublicationUseCase;
    this.getPublicationsUseCase = getPublicationsUseCase;
    this.getPublicationByIdUseCase = getPublicationByIdUseCase;
    this.likePublicationUseCase = likePublicationUseCase;
    this.unlikePublicationUseCase = unlikePublicationUseCase;
    this.addCommentUseCase = addCommentUseCase;
    this.deleteCommentUseCase = deleteCommentUseCase;
    this.getCommentsUseCase = getCommentsUseCase;

    // Bind methods para mantener contexto
    this.getPublications = this.getPublications.bind(this);
    this.getPublicationById = this.getPublicationById.bind(this);
    this.createPublication = this.createPublication.bind(this);
    this.likePublication = this.likePublication.bind(this);
    this.unlikePublication = this.unlikePublication.bind(this);
    this.addComment = this.addComment.bind(this);
    this.deleteComment = this.deleteComment.bind(this);
    this.getComments = this.getComments.bind(this);
  }

  /**
   * Obtener publicaciones con paginación
   */
  async getPublications(req, res) {
    try {
      console.log('📖 GetPublications - query params:', req.query);

      // Extraer parámetros de consulta
      const {
        page = 1,
        limit = 10,
        userId,
        visibility = 'public'
      } = req.query;

      // Preparar opciones para el caso de uso
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        userId,
        visibility
      };

      // Ejecutar caso de uso
      const result = await this.getPublicationsUseCase.execute(options);

      res.status(200).json({
        success: true,
        message: 'Publicaciones obtenidas exitosamente',
        data: result.publications,
        pagination: result.pagination
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Obtener publicación por ID
   */
  async getPublicationById(req, res) {
    try {
      const { id } = req.params;
      const requesterId = req.user?.id;

      console.log('🔍 GetPublicationById - ID:', id, 'Requester:', requesterId);

      // Ejecutar caso de uso
      const publication = await this.getPublicationByIdUseCase.execute(id, requesterId);

      res.status(200).json({
        success: true,
        message: 'Publicación obtenida exitosamente',
        data: publication
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Crear publicación
   * 
   * TRANSFORMACIÓN:
   * ANTES: 85 líneas de código mixto en postController.createPost
   * DESPUÉS: 25 líneas que solo orquestan
   */
  async createPublication(req, res) {
    try {
      console.log('📝 CreatePublication - req.body:', req.body);
      console.log('👤 CreatePublication - req.user:', req.user);

      // 1. Extraer datos de la request (capa de presentación)
      // Soporte para múltiples formatos de API
      const { 
        text, 
        content, 
        type, 
        visibility, 
        userId, 
        mediaUrls 
      } = req.body;
      
      // Determinar el authorId (prioridad: req.user.id, luego userId del body)
      const authorId = req.user?.id || userId || 'anonymous-user';
      
      // Determinar el contenido (content tiene prioridad sobre text)
      const publicationContent = content || text || '';
      
      // Files pueden venir del middleware de upload o de mediaUrls
      const files = req.files || [];
      
      // 2. Preparar DTO para el caso de uso
      const createData = {
        authorId,
        text: publicationContent,
        content: publicationContent, // Ambos para compatibilidad
        type: type || 'text',
        visibility: visibility || 'public',
        files,
        mediaUrls: mediaUrls || []
      };

      console.log('📤 Datos preparados para UseCase:', createData);

      // 3. Ejecutar caso de uso (aquí está TODA la lógica)
      const result = await this.createPublicationUseCase.execute(createData);

      // 4. Transformar respuesta (capa de presentación)
      res.status(201).json({
        success: true,
        message: 'Publicación creada exitosamente',
        data: result?.toJSON ? result.toJSON() : result
      });

    } catch (error) {
      console.error('Error en PublicationController:', error.message);
      console.error('Stack trace:', error.stack);
      
      // 5. Manejo de errores HTTP (solo presentación)
      this._handleError(res, error);
    }
  }

  /**
   * Dar like a publicación
   */
  async likePublication(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body; // También puede venir del body
      const finalUserId = req.user?.id || userId;

      if (!finalUserId) {
        return res.status(400).json({
          success: false,
          message: 'Usuario requerido para dar like'
        });
      }

      // Ejecutar caso de uso
      const result = await this.likePublicationUseCase.execute(id, finalUserId);

      res.status(200).json({
        success: true,
        message: 'Like agregado exitosamente',
        data: result
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Quitar like de publicación
   */
  async unlikePublication(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const finalUserId = req.user?.id || userId;

      if (!finalUserId) {
        return res.status(400).json({
          success: false,
          message: 'Usuario requerido para quitar like'
        });
      }

      // Ejecutar caso de uso
      const result = await this.unlikePublicationUseCase.execute(id, finalUserId);

      res.status(200).json({
        success: true,
        message: 'Like eliminado exitosamente',
        data: result
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Obtener comentarios de una publicación
   */
  async getComments(req, res) {
    try {
      const { id: publicationId } = req.params;
      const { hierarchical = false } = req.query;

      console.log('📝 GetComments - Publicación:', publicationId);

      // Preparar opciones
      const options = {
        hierarchical: hierarchical === 'true'
      };

      // Ejecutar caso de uso
      const result = await this.getCommentsUseCase.execute(publicationId, options);

      res.status(200).json({
        success: true,
        message: 'Comentarios obtenidos exitosamente',
        data: result
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Agregar comentario
   */
  async addComment(req, res) {
    try {
      const { id: publicationId } = req.params;
      const { text, content, userId, parentCommentId } = req.body;
      const authorId = req.user?.id || userId;

      if (!authorId) {
        return res.status(400).json({
          success: false,
          message: 'Usuario requerido para comentar'
        });
      }

      const commentContent = content || text || '';

      if (!commentContent.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Contenido del comentario requerido'
        });
      }

      // Ejecutar caso de uso
      const result = await this.addCommentUseCase.execute({
        publicationId,
        authorId,
        text: commentContent,
        parentCommentId
      });

      res.status(201).json({
        success: true,
        message: 'Comentario agregado exitosamente',
        data: result
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Eliminar comentario
   */
  async deleteComment(req, res) {
    try {
      const { id: publicationId, commentId } = req.params;
      const { userId } = req.body;
      const finalUserId = req.user?.id || userId;

      if (!finalUserId) {
        return res.status(400).json({
          success: false,
          message: 'Usuario requerido para eliminar comentario'
        });
      }

      // Ejecutar caso de uso
      const result = await this.deleteCommentUseCase.execute(publicationId, commentId, finalUserId);

      res.status(200).json({
        success: true,
        message: 'Comentario eliminado exitosamente',
        data: result
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  _handleError(res, error) {
    console.error('Error en PublicationController:', error.message);
    
    // Mapear errores de dominio a códigos HTTP
    if (error.message.includes('no encontrado') || error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('no tienes permisos') || error.message.includes('unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('requerido') || error.message.includes('inválido')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Error genérico
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = PublicationController;

