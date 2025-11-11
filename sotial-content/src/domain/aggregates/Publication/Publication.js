const PublicationId = require('./valueObjects/PublicationId');
const Content = require('./valueObjects/Content');
const Comment = require('./entities/Comment');
const MediaItem = require('./entities/MediaItem');
const { v4: uuidv4 } = require('uuid');


class Publication {
  constructor(id, authorId, text, type = 'text') {
    this._id = new PublicationId(id);
    this._authorId = authorId;
    this._text = text ? new Content(text) : new Content('');
    this._type = type; // 'text', 'image', 'video', 'text_image'
    this._mediaItems = new Map(); // Map<string, MediaItem>
    this._comments = new Map(); // Map<string, Comment>
    this._likes = new Set(); // Set<string> - User IDs que dieron like
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._status = 'published'; // 'draft', 'published', 'archived'
    this._visibility = 'public'; // 'public', 'private', 'friends'

    this.validateType(type);
  }

  validateType(type) {
    const validTypes = ['text', 'image', 'video', 'text_image'];
    if (!validTypes.includes(type)) {
      throw new Error(`Tipo de publicación inválido: ${type}`);
    }
  }

  // Getters
  get id() { return this._id; }
  get authorId() { return this._authorId; }
  get text() { return this._text; }
  get type() { return this._type; }
  get mediaItems() { return Array.from(this._mediaItems.values()); }
  get comments() { return Array.from(this._comments.values()); }
  get likes() { return Array.from(this._likes); }
  get createdAt() { return this._createdAt; }
  get updatedAt() { return this._updatedAt; }
  get status() { return this._status; }
  get visibility() { return this._visibility; }

  // Contadores
  get likesCount() { return this._likes.size; }
  get commentsCount() { return this._comments.size; }
  get mediaItemsCount() { return this._mediaItems.size; }

  // Métodos de negocio del diagrama

  /**
   * Agregar comentario - addComment(authorId, text)
   */
  addComment(authorId, text, parentCommentId = null) {
    if (!authorId || typeof authorId !== 'string') {
      throw new Error('AuthorId es requerido para el comentario');
    }

    const commentId = uuidv4();
    const comment = new Comment(
      commentId,
      authorId,
      text,
      this._id.value,
      parentCommentId
    );

    // Si es una respuesta, verificar que el comentario padre existe
    if (parentCommentId && !this._comments.has(parentCommentId)) {
      throw new Error('El comentario padre no existe');
    }

    this._comments.set(commentId, comment);
    this._updatedAt = new Date();

    return {
      type: 'COMMENT_ADDED',
      publicationId: this._id.value,
      commentId,
      authorId,
      parentCommentId,
      timestamp: this._updatedAt
    };
  }

  /**
   * Eliminar comentario - deleteComment(commentId, userId)
   */
  deleteComment(commentId, userId) {
    const comment = this._comments.get(commentId);
    
    if (!comment) {
      throw new Error('Comentario no encontrado');
    }

    // Solo el autor del comentario o el autor de la publicación pueden eliminarlo
    if (comment.authorId !== userId && this._authorId !== userId) {
      throw new Error('No tienes permisos para eliminar este comentario');
    }

    comment.markAsDeleted();
    this._updatedAt = new Date();

    return {
      type: 'COMMENT_DELETED',
      publicationId: this._id.value,
      commentId,
      deletedBy: userId,
      timestamp: this._updatedAt
    };
  }

  /**
   * Dar like - like(userId)
   */
  like(userId) {
    if (!userId || typeof userId !== 'string') {
      throw new Error('UserId es requerido para dar like');
    }

    // No se puede dar like a propia publicación
    if (userId === this._authorId) {
      throw new Error('No puedes dar like a tu propia publicación');
    }

    // Verificar si ya dio like
    if (this._likes.has(userId)) {
      throw new Error('Ya diste like a esta publicación');
    }

    this._likes.add(userId);
    this._updatedAt = new Date();

    return {
      type: 'PUBLICATION_LIKED',
      publicationId: this._id.value,
      userId,
      timestamp: this._updatedAt
    };
  }

  /**
   * Quitar like - unlike(userId)
   */
  unlike(userId) {
    if (!this._likes.has(userId)) {
      throw new Error('No has dado like a esta publicación');
    }

    this._likes.delete(userId);
    this._updatedAt = new Date();

    return {
      type: 'PUBLICATION_UNLIKED',
      publicationId: this._id.value,
      userId,
      timestamp: this._updatedAt
    };
  }

  /**
   * Agregar elemento multimedia - addMediaItem(type, url, filename, size)
   */
  addMediaItem(type, url, filename, size, order = null) {
    const mediaItemId = uuidv4();
    const itemOrder = order !== null ? order : this._mediaItems.size;
    
    const mediaItem = new MediaItem(
      mediaItemId,
      this._id.value,
      type,
      url,
      filename,
      size,
      itemOrder
    );

    this._mediaItems.set(mediaItemId, mediaItem);
    this._updateType();
    this._updatedAt = new Date();

    return {
      type: 'MEDIA_ITEM_ADDED',
      publicationId: this._id.value,
      mediaItemId,
      mediaType: type,
      timestamp: this._updatedAt
    };
  }

  /**
   * Remover elemento multimedia - removeMediaItem(mediaItemId)
   */
  removeMediaItem(mediaItemId) {
    if (!this._mediaItems.has(mediaItemId)) {
      throw new Error('Elemento multimedia no encontrado');
    }

    this._mediaItems.delete(mediaItemId);
    this._reorderMediaItems();
    this._updateType();
    this._updatedAt = new Date();

    return {
      type: 'MEDIA_ITEM_REMOVED',
      publicationId: this._id.value,
      mediaItemId,
      timestamp: this._updatedAt
    };
  }

  /**
   * Actualizar contenido de texto
   */
  updateText(newText) {
    this._text = new Content(newText);
    this._updateType();
    this._updatedAt = new Date();
  }

  /**
   * Cambiar visibilidad
   */
  changeVisibility(newVisibility) {
    const validVisibilities = ['public', 'private', 'friends'];
    if (!validVisibilities.includes(newVisibility)) {
      throw new Error(`Visibilidad inválida: ${newVisibility}`);
    }

    this._visibility = newVisibility;
    this._updatedAt = new Date();
  }

  // Métodos auxiliares privados

  /**
   * Actualizar el tipo basado en el contenido
   */
  _updateType() {
    const hasText = !this._text.isEmpty();
    const hasMedia = this._mediaItems.size > 0;
    
    if (hasText && hasMedia) {
      this._type = 'text_image';
    } else if (hasMedia) {
      // Determinar si es imagen o video basado en el primer media item
      const firstMedia = this._mediaItems.values().next().value;
      this._type = firstMedia ? firstMedia.type : 'text';
    } else {
      this._type = 'text';
    }
  }

  /**
   * Reordenar elementos multimedia después de eliminación
   */
  _reorderMediaItems() {
    const items = Array.from(this._mediaItems.values())
      .sort((a, b) => a.order - b.order);
    
    items.forEach((item, index) => {
      item.updateOrder(index);
    });
  }

  // Verificaciones de estado

  /**
   * Verificar si un usuario dio like
   */
  hasLikedBy(userId) {
    return this._likes.has(userId);
  }

  /**
   * Verificar si la publicación tiene comentarios
   */
  hasComments() {
    return this._comments.size > 0;
  }

  /**
   * Verificar si la publicación tiene medios
   */
  hasMedia() {
    return this._mediaItems.size > 0;
  }

  /**
   * Obtener comentarios activos (no eliminados)
   */
  getActiveComments() {
    return Array.from(this._comments.values())
      .filter(comment => comment.isActive());
  }

  /**
   * Serialización
   */
  toJSON() {
    return {
      id: this._id.value,
      authorId: this._authorId,
      text: this._text.text,
      type: this._type,
      mediaItems: this.mediaItems.map(item => item.toJSON()),
      comments: this.getActiveComments().map(comment => comment.toJSON()),
      likesCount: this.likesCount,
      commentsCount: this.commentsCount,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      status: this._status,
      visibility: this._visibility
    };
  }
}

module.exports = Publication;