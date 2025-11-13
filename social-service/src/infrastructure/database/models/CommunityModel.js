const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Community = sequelize.define('Community', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    creator_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'ID del usuario que creó la comunidad'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre de la comunidad'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción de la comunidad'
    },
    category: {
      type: DataTypes.ENUM(
        'Deportes', 'Arte', 'Musica', 'Lectura', 'Tecnologia', 
        'Naturaleza', 'Voluntariado', 'Gaming', 'Fotografia', 
        'Cocina', 'Baile', 'Meditacion'
      ),
      allowNull: false,
      comment: 'Categoría de la comunidad'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Etiquetas de la comunidad'
    },
    community_image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL de la imagen de la comunidad'
    },
    members_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Cantidad de miembros'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si la comunidad está activa'
    }
  }, {
    tableName: 'communities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['creator_id'] },
      { fields: ['category'] },
      { fields: ['is_active'] }
    ]
  });

  // Define associations
  Community.associate = (models) => {
    // Una comunidad pertenece a un creador
    Community.belongsTo(models.UserProfile, {
      foreignKey: 'creator_id',
      as: 'creator'
    });

    // Una comunidad tiene muchos miembros
    Community.belongsToMany(models.UserProfile, {
      through: models.CommunityMember,
      foreignKey: 'community_id',
      otherKey: 'user_id',
      as: 'members'
    });

    // Una comunidad tiene muchos community_members
    Community.hasMany(models.CommunityMember, {
      foreignKey: 'community_id',
      as: 'memberships'
    });
  };

  return Community;
};