'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('media', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      post_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID del post al que pertenece el archivo',
        references: {
          model: 'posts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('image', 'video', 'audio', 'document'),
        allowNull: false,
        comment: 'Tipo de archivo multimedia'
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'URL del archivo en Cloudinary o storage'
      },
      public_id: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Public ID de Cloudinary para gestión del archivo'
      },
      original_name: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Nombre original del archivo'
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Tipo MIME del archivo'
      },
      size: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Tamaño del archivo en bytes'
      },
      width: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Ancho en píxeles (para imágenes y videos)'
      },
      height: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Alto en píxeles (para imágenes y videos)'
      },
      duration: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Duración en segundos (para videos y audios)'
      },
      format: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Formato del archivo (jpg, png, mp4, etc.)'
      },
      alt_text: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Texto alternativo para accesibilidad'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del archivo'
      },
      order_position: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Posición de orden en el post'
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si es el archivo principal del post'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Índices para media
    await queryInterface.addIndex('media', ['post_id'], { name: 'idx_media_post_id' });
    await queryInterface.addIndex('media', ['type'], { name: 'idx_media_type' });
    await queryInterface.addIndex('media', ['post_id', 'order_position'], { name: 'idx_media_post_order' });
    await queryInterface.addIndex('media', ['post_id', 'is_primary'], { name: 'idx_media_post_primary' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('media');
  }
};