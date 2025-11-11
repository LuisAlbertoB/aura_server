// Modelo UserProfile - Mapeo exacto de la tabla user_profiles de la BD
module.exports = (sequelize, DataTypes) => {
  const UserProfileModel = sequelize.define('UserProfile', {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      unique: true,
      comment: 'ID del usuario (referencia externa)'
    },
    display_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre a mostrar'
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Biografía del usuario'
    },
    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL del avatar'
    },
    cover_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL de imagen de portada'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Ubicación del usuario'
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Sitio web personal'
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Fecha de nacimiento'
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
      allowNull: true,
      comment: 'Género'
    },
    privacy_settings: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuraciones de privacidad'
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Preferencias del usuario'
    },
    followers_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Número de seguidores'
    },
    following_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Número de usuarios seguidos'
    },
    posts_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Número de publicaciones'
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Cuenta verificada'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Cuenta activa'
    },
    last_active_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Última actividad'
    }
  }, {
    tableName: 'user_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id']
      },
      {
        fields: ['display_name']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['is_verified']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return UserProfileModel;
};