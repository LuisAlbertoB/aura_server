const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserPreference = sequelize.define('UserPreference', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
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
          const validPreferences = [
            'Deportes', 'Arte', 'Musica', 'Lectura', 'Tecnologia', 
            'Naturaleza', 'Voluntariado', 'Gaming', 'Fotografia', 
            'Cocina', 'Baile', 'Meditacion'
          ];
          
          if (!Array.isArray(value)) {
            throw new Error('Las preferencias deben ser un array');
          }
          
          for (const pref of value) {
            if (!validPreferences.includes(pref)) {
              throw new Error(`Preferencia inválida: ${pref}`);
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

  // Define associations
  UserPreference.associate = (models) => {
    // Una preferencia pertenece a un usuario
    UserPreference.belongsTo(models.UserProfile, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return UserPreference;
};