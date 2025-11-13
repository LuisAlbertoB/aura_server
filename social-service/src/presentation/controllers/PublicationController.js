
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
      console.log('👤 GetPublications - user from token:', req.user);

      // Extraer parámetros de consulta
      const {
        page = 1,
        limit = 10,
        userId,
        visibility = 'all'
      } = req.query;

      // Preparar opciones para el caso de uso
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        userId,
        currentUserId: req.user?.id, // ✅ CRÍTICO: Pasar usuario actual para filtros de visibilidad
        visibility
      };

      console.log('📤 Opciones enviadas al UseCase:', options);

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
      console.log('� CreatePublication - req.files:', req.files);
      console.log('�👤 CreatePublication - req.user:', req.user);

      // Extraer datos del body
      const { content, type, visibility, location, tags } = req.body;
      
      // Procesar archivos subidos
      const mediaUrls = [];
      if (req.files && req.files.length > 0) {
          console.log(`📤 Procesando ${req.files.length} archivo(s)...`);
          
          req.files.forEach((file, index) => {
              // Construir URL pública del archivo
              const fileUrl = `http://54.146.237.63:3002/uploads/publications/${file.filename}`;
              mediaUrls.push(fileUrl);
              console.log(`✅ Archivo ${index + 1} guardado:`, fileUrl);
          });
      }

      // Parsear tags si viene como string
      let parsedTags = [];
      if (tags) {
          try {
              parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
          } catch (e) {
              console.log('⚠️ Error parseando tags, usando array vacío');
          }
      }

      // Preparar datos para el UseCase
      const publicationData = {
          authorId: req.user.id,
          text: content || '',
          content: content || '',
          type: type || 'text',
          visibility: visibility || 'public',
          location: location || null,
          tags: parsedTags,
          files: req.files || [],
          mediaUrls: mediaUrls
      };

      console.log('📤 Datos preparados para UseCase:', publicationData);

      // Llamar al caso de uso
      const publication = await this.createPublicationUseCase.execute(publicationData);

      console.log('✅ Respuesta final del controlador:', publication);

      res.status(201).json({
          success: true,
          message: 'Publicación creada exitosamente',
          data: publication
      });
    } catch (error) {
      console.error('❌ Error creando publicación:', error);
      res.status(500).json({
          success: false,
          message: 'Error al crear publicación',
          error: error.message
      });
    }
  }

  /**
   * Dar like a publicación
   */
  async likePublication(req, res) {
    try {
      const { id } = req.params;
      const finalUserId = req.user.id; // Se obtiene del token

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
      const finalUserId = req.user.id; // Se obtiene del token

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
      const { text, content, parentCommentId } = req.body;
      const authorId = req.user.id; // Se obtiene del token

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
      const finalUserId = req.user.id; // Se obtiene del token

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
