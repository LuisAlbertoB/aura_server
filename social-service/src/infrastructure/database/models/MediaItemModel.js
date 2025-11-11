// Modelo Media - Mapeo exacto de la tabla media de la BD
module.exports = (sequelize, DataTypes) => {
  const MediaItemModel = sequelize.define('MediaItem', {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false
    },
    post_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      comment: 'ID del post al que pertenece el archivo'
    },
    type: {
      type: DataTypes.ENUM('image', 'video', 'audio', 'document'),
      allowNull: false,
      comment: 'Tipo de archivo multimedia'
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'URL del archivo en Cloudinary o storage'
    },
    public_id: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Public ID de Cloudinary para gestión del archivo'
    },
    original_name: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Nombre original del archivo'
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Tipo MIME del archivo'
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Tamaño del archivo en bytes'
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Ancho en píxeles (para imágenes y videos)'
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Alto en píxeles (para imágenes y videos)'
    },
    duration: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Duración en segundos (para videos y audios)'
    },
    format: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Formato del archivo (jpg, png, mp4, etc.)'
    },
    alt_text: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Texto alternativo para accesibilidad'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Metadatos adicionales del archivo'
    },
    order_position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Posición de orden en el post'
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica si es el archivo principal del post'
    }
  }, {
    tableName: 'media',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['post_id']
      },
      {
        fields: ['type']
      },
      {
        fields: ['post_id', 'order_position']
      },
      {
        fields: ['public_id']
      }
    ]
  });

  return MediaItemModel;
};