// Modelo Like - Mapeo exacto de la tabla likes de la BD
module.exports = (sequelize, DataTypes) => {
  const LikeModel = sequelize.define('Like', {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      comment: 'ID del usuario que dio el like'
    },
    likeable_type: {
      type: DataTypes.ENUM('post', 'comment'),
      allowNull: false,
      comment: 'Tipo de entidad que recibió el like'
    },
    likeable_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      comment: 'ID de la entidad que recibió el like'
    },
    type: {
      type: DataTypes.ENUM('like', 'dislike', 'love', 'angry', 'sad', 'wow'),
      allowNull: false,
      defaultValue: 'like',
      comment: 'Tipo de reacción'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'likes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['likeable_id']
      },
      {
        fields: ['likeable_type']
      },
      {
        fields: ['type']
      },
      {
        unique: true,
        fields: ['user_id', 'likeable_id', 'likeable_type']
      }
    ],
    validate: {
      // Validar que el likeable_type sea válido
      validLikeableType() {
        if (!this.likeable_type || !['post', 'comment'].includes(this.likeable_type)) {
          throw new Error('likeable_type debe ser "post" o "comment"');
        }
      }
    }
  });

  return LikeModel;
};