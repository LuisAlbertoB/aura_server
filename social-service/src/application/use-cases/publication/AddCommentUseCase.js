

class AddCommentUseCase {
  constructor(publicationRepository) {
    this.publicationRepository = publicationRepository;
  }

  /**
   * Agregar comentario a una publicación
   */
  async execute(data) {
    try {
      const { publicationId, authorId, text, parentCommentId = null } = data;

      // 1. Validaciones de entrada
      this._validateInput(data);

      // 2. Obtener la publicación
      const publication = await this.publicationRepository.findById(publicationId);
      
      if (!publication) {
        throw new Error('Publicación no encontrada');
      }

      // 3. Usar método del agregado (la lógica está ahí)
      const commentEvent = publication.addComment(authorId, text, parentCommentId);
      
      // 4. Persistir cambios
      await this.publicationRepository.save(publication);

      // 5. Retornar resultado
      return {
        success: true,
        event: commentEvent,
        comment: {
          id: commentEvent.commentId,
          authorId: commentEvent.authorId,
          text,
          parentCommentId,
          publicationId: commentEvent.publicationId,
          timestamp: commentEvent.timestamp
        },
        publication: {
          id: publication.id.value,
          commentsCount: publication.commentsCount
        }
      };

    } catch (error) {
      throw new Error(`Error al agregar comentario: ${error.message}`);
    }
  }

  _validateInput(data) {
    if (!data.publicationId) {
      throw new Error('ID de publicación es requerido');
    }
    if (!data.authorId) {
      throw new Error('ID de autor es requerido');
    }
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('El texto del comentario es requerido');
    }
  }
}

class DeleteCommentUseCase {
  constructor(publicationRepository) {
    this.publicationRepository = publicationRepository;
  }

  /**
   * Eliminar un comentario
   */
  async execute(publicationId, commentId, userId) {
    try {
      // 1. Obtener la publicación
      const publication = await this.publicationRepository.findById(publicationId);
      
      if (!publication) {
        throw new Error('Publicación no encontrada');
      }

      // 2. Usar método del agregado
      const deleteEvent = publication.deleteComment(commentId, userId);
      
      // 3. Persistir cambios
      await this.publicationRepository.save(publication);

      // 4. Retornar resultado
      return {
        success: true,
        event: deleteEvent,
        publication: {
          id: publication.id.value,
          commentsCount: publication.commentsCount
        }
      };

    } catch (error) {
      throw new Error(`Error al eliminar comentario: ${error.message}`);
    }
  }
}

module.exports = {
  AddCommentUseCase,
  DeleteCommentUseCase
};