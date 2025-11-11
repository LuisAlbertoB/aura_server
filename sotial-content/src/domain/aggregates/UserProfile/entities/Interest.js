
class Interest {
  constructor(id, name, userId) {
    if (!id || typeof id !== 'string') {
      throw new Error('Interest requiere un ID válido');
    }
    if (!name || typeof name !== 'string') {
      throw new Error('Interest requiere un nombre válido');
    }
    if (!userId || typeof userId !== 'string') {
      throw new Error('Interest requiere un userId válido');
    }

    this._id = id;
    this._name = name;
    this._userId = userId;
    this._createdAt = new Date();
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get userId() {
    return this._userId;
  }

  get createdAt() {
    return this._createdAt;
  }

  // Método para actualizar el nombre del interés
  updateName(newName) {
    if (!newName || typeof newName !== 'string') {
      throw new Error('El nuevo nombre del interés debe ser válido');
    }
    
    if (newName.length > 100) {
      throw new Error('El nombre del interés no puede exceder 100 caracteres');
    }
    
    this._name = newName;
  }

  equals(other) {
    return other instanceof Interest && this._id === other._id;
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      userId: this._userId,
      createdAt: this._createdAt
    };
  }
}

module.exports = Interest;