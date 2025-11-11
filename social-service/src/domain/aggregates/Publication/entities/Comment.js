
class Comment {
  constructor(id, authorId, text, publicationId, parentCommentId = null) {
    this.validate(id, authorId, text, publicationId);
    
    this._id = id;
    this._authorId = authorId;
    this._text = text;
    this._publicationId = publicationId;
    this._parentCommentId = parentCommentId;
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._likesCount = 0;
    this._isEdited = false;
    this._status = 'active'; // active, deleted, hidden
  }

  validate(id, authorId, text, publicationId) {
    if (!id || typeof id !== 'string') {
      throw new Error('Comment requiere un ID válido');
    }
    if (!authorId || typeof authorId !== 'string') {
      throw new Error('Comment requiere un authorId válido');
    }
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Comment requiere texto válido');
    }
    if (text.length > 1000) {
      throw new Error('El comentario no puede exceder 1000 caracteres');
    }
    if (!publicationId || typeof publicationId !== 'string') {
      throw new Error('Comment requiere un publicationId válido');
    }
  }

  // Getters
  get id() { return this._id; }
  get authorId() { return this._authorId; }
  get text() { return this._text; }
  get publicationId() { return this._publicationId; }
  get parentCommentId() { return this._parentCommentId; }
  get createdAt() { return this._createdAt; }
  get updatedAt() { return this._updatedAt; }
  get likesCount() { return this._likesCount; }
  get isEdited() { return this._isEdited; }
  get status() { return this._status; }

  // Métodos de negocio
  updateText(newText) {
    if (!newText || typeof newText !== 'string' || newText.trim().length === 0) {
      throw new Error('El nuevo texto del comentario debe ser válido');
    }
    if (newText.length > 1000) {
      throw new Error('El comentario no puede exceder 1000 caracteres');
    }

    this._text = newText;
    this._updatedAt = new Date();
    this._isEdited = true;
  }

  incrementLikes() {
    this._likesCount++;
  }

  decrementLikes() {
    if (this._likesCount > 0) {
      this._likesCount--;
    }
  }

  markAsDeleted() {
    this._status = 'deleted';
    this._updatedAt = new Date();
  }

  hide() {
    this._status = 'hidden';
    this._updatedAt = new Date();
  }

  isReply() {
    return this._parentCommentId !== null;
  }

  isActive() {
    return this._status === 'active';
  }

  equals(other) {
    return other instanceof Comment && this._id === other._id;
  }

  toJSON() {
    return {
      id: this._id,
      authorId: this._authorId,
      text: this._text,
      publicationId: this._publicationId,
      parentCommentId: this._parentCommentId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      likesCount: this._likesCount,
      isEdited: this._isEdited,
      status: this._status
    };
  }
}

module.exports = Comment;