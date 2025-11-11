
class Bio {
  constructor(value) {
    this.validate(value);
    this._value = value;
  }

  validate(value) {
    if (value !== null && value !== undefined) {
      if (typeof value !== 'string') {
        throw new Error('La biografía debe ser un texto');
      }
      
      if (value.length > 500) {
        throw new Error('La biografía no puede exceder 500 caracteres');
      }
      
      // Validar contenido apropiado (sin palabras ofensivas básicas)
      const inappropriateWords = ['spam', 'scam']; // Lista básica
      const lowerValue = value.toLowerCase();
      if (inappropriateWords.some(word => lowerValue.includes(word))) {
        throw new Error('La biografía contiene contenido inapropiado');
      }
    }
  }

  get value() {
    return this._value;
  }

  isEmpty() {
    return !this._value || this._value.trim().length === 0;
  }

  equals(other) {
    return other instanceof Bio && this._value === other._value;
  }

  toString() {
    return this._value || '';
  }
}

module.exports = Bio;