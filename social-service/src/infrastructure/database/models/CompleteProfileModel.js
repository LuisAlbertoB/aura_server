const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CompleteProfile = sequelize.define('CompleteProfile', {
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
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nombre completo'
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Edad del usuario',
      validate: {
        min: 1,
        max: 120
      }
    },
    profile_picture: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL de la foto de perfil'
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción breve del usuario',
      validate: {
        len: [0, 500] // Máximo 500 caracteres
      }
    },
    hobbies: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Hobbies principales del usuario'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Ubicación del usuario'
    },
    website: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Sitio web personal',
      validate: {
        isUrl: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Número de teléfono'
    }
  }, {
    tableName: 'complete_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'], unique: true }
    ]
  });

  return CompleteProfile;
};