'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      post_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID del post al que pertenece el comentario',
        references: {
          model: 'posts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID del usuario que hizo el comentario'
      },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'ID del comentario padre (para respuestas)',
        references: {
          model: 'comments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Contenido del comentario'
      },
      likes_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Contador de likes del comentario'
      },
      replies_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Contador de respuestas'
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Nivel de anidación del comentario'
      },
      is_edited: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si el comentario fue editado'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Estado activo del comentario'
      },
      edited_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de última edición'
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

    // Índices para comments
    await queryInterface.addIndex('comments', ['post_id'], { name: 'idx_comments_post_id' });
    await queryInterface.addIndex('comments', ['user_id'], { name: 'idx_comments_user_id' });
    await queryInterface.addIndex('comments', ['parent_id'], { name: 'idx_comments_parent_id' });
    await queryInterface.addIndex('comments', ['post_id', 'parent_id'], { name: 'idx_comments_post_parent' });
    await queryInterface.addIndex('comments', ['created_at'], { name: 'idx_comments_created_at' });
    await queryInterface.addIndex('comments', ['is_active'], { name: 'idx_comments_is_active' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comments');
  }
};