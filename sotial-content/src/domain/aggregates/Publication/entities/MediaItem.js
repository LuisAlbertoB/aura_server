
class MediaItem {
  constructor(id, publicationId, type, url, filename, size, order = 0) {
    this.validate(id, publicationId, type, url, filename, size);
    
    this._id = id;
    this._publicationId = publicationId;
    this._type = type; // 'image' | 'video'
    this._url = url;
    this._filename = filename;
    this._size = size;
    this._order = order;
    this._createdAt = new Date();
    this._cloudinaryPublicId = null;
    this._metadata = {};
  }

  validate(id, publicationId, type, url, filename, size) {
    if (!id || typeof id !== 'string') {
      throw new Error('MediaItem requiere un ID válido');
    }
    if (!publicationId || typeof publicationId !== 'string') {
      throw new Error('MediaItem requiere un publicationId válido');
    }
    if (!['image', 'video'].includes(type)) {
      throw new Error('MediaItem type debe ser "image" o "video"');
    }
    if (!url || typeof url !== 'string') {
      throw new Error('MediaItem requiere una URL válida');
    }
    if (!filename || typeof filename !== 'string') {
      throw new Error('MediaItem requiere un filename válido');
    }
    if (!size || typeof size !== 'number' || size <= 0) {
      throw new Error('MediaItem requiere un size válido mayor a 0');
    }
  }

  // Getters
  get id() { return this._id; }
  get publicationId() { return this._publicationId; }
  get type() { return this._type; }
  get url() { return this._url; }
  get filename() { return this._filename; }
  get size() { return this._size; }
  get order() { return this._order; }
  get createdAt() { return this._createdAt; }
  get cloudinaryPublicId() { return this._cloudinaryPublicId; }
  get metadata() { return { ...this._metadata }; }

  // Métodos de negocio
  setCloudinaryData(publicId, metadata = {}) {
    if (!publicId || typeof publicId !== 'string') {
      throw new Error('CloudinaryPublicId debe ser válido');
    }
    
    this._cloudinaryPublicId = publicId;
    this._metadata = { ...this._metadata, ...metadata };
  }

  updateOrder(newOrder) {
    if (typeof newOrder !== 'number' || newOrder < 0) {
      throw new Error('El orden debe ser un número mayor o igual a 0');
    }
    
    this._order = newOrder;
  }

  setDimensions(width, height) {
    if (this._type !== 'image') {
      throw new Error('Solo las imágenes pueden tener dimensiones');
    }
    
    this._metadata.width = width;
    this._metadata.height = height;
  }

  setDuration(duration) {
    if (this._type !== 'video') {
      throw new Error('Solo los videos pueden tener duración');
    }
    
    this._metadata.duration = duration;
  }

  isImage() {
    return this._type === 'image';
  }

  isVideo() {
    return this._type === 'video';
  }

  getSizeInMB() {
    return (this._size / (1024 * 1024)).toFixed(2);
  }

  equals(other) {
    return other instanceof MediaItem && this._id === other._id;
  }

  toJSON() {
    return {
      id: this._id,
      publicationId: this._publicationId,
      type: this._type,
      url: this._url,
      filename: this._filename,
      size: this._size,
      order: this._order,
      createdAt: this._createdAt,
      cloudinaryPublicId: this._cloudinaryPublicId,
      metadata: this._metadata
    };
  }
}

module.exports = MediaItem;