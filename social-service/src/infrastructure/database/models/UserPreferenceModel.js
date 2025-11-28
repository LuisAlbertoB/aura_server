// infrastructure/database/models/UserPreferenceModel.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserPreference = sequelize.define('UserPreference', {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      unique: true,
      comment: 'ID del usuario'
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: 'Array de preferencias del usuario',
      validate: {
        isValidPreferences(value) {
          // ✅ CORREGIDO: Agregadas tildes y eñes correctas
          const validPreferences = [
            'Deportes', 'Arte', 'Música', 'Lectura', 'Tecnología', 
            'Naturaleza', 'Voluntariado', 'Gaming', 'Fotografía', 
            'Cocina', 'Baile', 'Meditación'
          ];
          
          if (!Array.isArray(value)) {
            throw new Error('Las preferencias deben ser un array');
          }
          
          for (const pref of value) {
            if (!validPreferences.includes(pref)) {
              throw new Error(`Preferencia inválida: ${pref}. Válidas: ${validPreferences.join(', ')}`);
            }
          }
        }
      }
    }
  }, {
    tableName: 'user_preferences',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'], unique: true }
    ]
  });

  return UserPreference;
};