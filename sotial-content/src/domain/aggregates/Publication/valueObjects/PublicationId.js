
class PublicationId {
  constructor(value) {
    this.validate(value);
    this._value = value;
  }

  validate(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('PublicationId debe ser un string no vacío');
    }
    
    // Validar formato UUID básico
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('PublicationId debe tener formato UUID válido');
    }
  }

  get value() {
    return this._value;
  }

  equals(other) {
    return other instanceof PublicationId && this._value === other._value;
  }

  toString() {
    return this._value;
  }
}

module.exports = PublicationId;