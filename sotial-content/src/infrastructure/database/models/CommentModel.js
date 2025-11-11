// Modelo Comment - Mapeo exacto de la tabla comments de la BD
module.exports = (sequelize, DataTypes) => {
  const CommentModel = sequelize.define('Comment', {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false
    },
    post_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      comment: 'ID del post al que pertenece el comentario'
    },
    user_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      comment: 'ID del usuario que hizo el comentario'
    },
    parent_id: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      comment: 'ID del comentario padre (para respuestas)'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Contenido del comentario'
    },
    likes_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Contador de likes del comentario'
    },
    replies_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Contador de respuestas'
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Nivel de anidación del comentario'
    },
    is_edited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica si el comentario fue editado'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Estado activo del comentario'
    },
    edited_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de última edición'
    }
  }, {
    tableName: 'comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['post_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['parent_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return CommentModel;
};