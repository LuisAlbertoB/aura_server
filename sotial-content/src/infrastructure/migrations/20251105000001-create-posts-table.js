'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID del usuario que creó el post'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Contenido de texto del post'
      },
      type: {
        type: Sequelize.ENUM('text', 'image', 'video', 'text_image', 'text_video'),
        allowNull: false,
        defaultValue: 'text',
        comment: 'Tipo de contenido del post'
      },
      visibility: {
        type: Sequelize.ENUM('public', 'private', 'friends'),
        allowNull: false,
        defaultValue: 'public',
        comment: 'Visibilidad del post'
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Ubicación asociada al post'
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Tags o etiquetas del post'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Metadatos adicionales del post'
      },
      likes_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Contador de likes'
      },
      comments_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Contador de comentarios'
      },
      shares_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Contador de compartidos'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Estado activo del post'
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

    // Índices para posts
    await queryInterface.addIndex('posts', ['user_id'], { name: 'idx_posts_user_id' });
    await queryInterface.addIndex('posts', ['type'], { name: 'idx_posts_type' });
    await queryInterface.addIndex('posts', ['visibility'], { name: 'idx_posts_visibility' });
    await queryInterface.addIndex('posts', ['created_at'], { name: 'idx_posts_created_at' });
    await queryInterface.addIndex('posts', ['is_active'], { name: 'idx_posts_is_active' });
    await queryInterface.addIndex('posts', ['user_id', 'visibility', 'is_active'], { 
      name: 'idx_posts_user_visibility_active' 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('posts');
  }
};