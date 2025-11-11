'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('likes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID del usuario que dio el like'
      },
      likeable_type: {
        type: Sequelize.ENUM('post', 'comment'),
        allowNull: false,
        comment: 'Tipo de entidad que recibió el like'
      },
      likeable_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID de la entidad que recibió el like'
      },
      type: {
        type: Sequelize.ENUM('like', 'dislike', 'love', 'angry', 'sad', 'wow'),
        allowNull: false,
        defaultValue: 'like',
        comment: 'Tipo de reacción'
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

    // Índices para likes
    await queryInterface.addIndex('likes', ['user_id', 'likeable_type', 'likeable_id'], { 
      unique: true,
      name: 'idx_likes_user_likeable_unique' 
    });
    await queryInterface.addIndex('likes', ['likeable_type', 'likeable_id'], { name: 'idx_likes_likeable' });
    await queryInterface.addIndex('likes', ['user_id'], { name: 'idx_likes_user_id' });
    await queryInterface.addIndex('likes', ['type'], { name: 'idx_likes_type' });
    await queryInterface.addIndex('likes', ['created_at'], { name: 'idx_likes_created_at' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('likes');
  }
};