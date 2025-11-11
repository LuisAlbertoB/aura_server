

class LikePublicationUseCase {
  constructor(publicationRepository) {
    this.publicationRepository = publicationRepository;
  }

  /**
   * Dar like a una publicación
   */
  async execute(publicationId, userId) {
    try {
      // 1. Obtener la publicación (agregado completo)
      const publication = await this.publicationRepository.findById(publicationId);
      
      if (!publication) {
        throw new Error('Publicación no encontrada');
      }

      // 2. La lógica de negocio está en el agregado
      const likeEvent = publication.like(userId);
      
      // 3. Persistir cambios
      await this.publicationRepository.save(publication);

      // 4. Retornar evento/resultado
      return {
        success: true,
        event: likeEvent,
        publication: {
          id: publication.id.value,
          likesCount: publication.likesCount,
          hasLikedByUser: publication.hasLikedBy(userId)
        }
      };

    } catch (error) {
      throw new Error(`Error al dar like: ${error.message}`);
    }
  }
}

class UnlikePublicationUseCase {
  constructor(publicationRepository) {
    this.publicationRepository = publicationRepository;
  }

  /**
   * Quitar like de una publicación
   */
  async execute(publicationId, userId) {
    try {
      // 1. Obtener la publicación
      const publication = await this.publicationRepository.findById(publicationId);
      
      if (!publication) {
        throw new Error('Publicación no encontrada');
      }

      // 2. La lógica está en el agregado
      const unlikeEvent = publication.unlike(userId);
      
      // 3. Persistir cambios
      await this.publicationRepository.save(publication);

      // 4. Retornar resultado
      return {
        success: true,
        event: unlikeEvent,
        publication: {
          id: publication.id.value,
          likesCount: publication.likesCount,
          hasLikedByUser: publication.hasLikedBy(userId)
        }
      };

    } catch (error) {
      throw new Error(`Error al quitar like: ${error.message}`);
    }
  }
}

module.exports = {
  LikePublicationUseCase,
  UnlikePublicationUseCase
};

