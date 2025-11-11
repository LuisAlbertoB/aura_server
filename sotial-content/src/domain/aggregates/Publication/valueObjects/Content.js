
class Content {
  constructor(text) {
    this.validate(text);
    this._text = text;
  }

  validate(text) {
    if (text !== null && text !== undefined) {
      if (typeof text !== 'string') {
        throw new Error('El contenido debe ser un texto');
      }
      
      if (text.length > 5000) {
        throw new Error('El contenido no puede exceder 5000 caracteres');
      }
      
      // Validar contenido apropiado
      const inappropriateWords = ['spam', 'scam', 'hate']; // Lista básica
      const lowerText = text.toLowerCase();
      if (inappropriateWords.some(word => lowerText.includes(word))) {
        throw new Error('El contenido contiene palabras inapropiadas');
      }
    }
  }

  get text() {
    return this._text;
  }

  isEmpty() {
    return !this._text || this._text.trim().length === 0;
  }

  getWordsCount() {
    if (this.isEmpty()) return 0;
    return this._text.trim().split(/\s+/).length;
  }

  getCharactersCount() {
    return this._text ? this._text.length : 0;
  }

  equals(other) {
    return other instanceof Content && this._text === other._text;
  }

  toString() {
    return this._text || '';
  }
}

module.exports = Content;