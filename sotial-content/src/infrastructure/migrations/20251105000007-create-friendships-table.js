'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('friendships', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      requester_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID del usuario que envió la solicitud de amistad'
      },
      addressee_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID del usuario que recibió la solicitud de amistad'
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected', 'blocked'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado de la amistad'
      },
      requested_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Fecha de solicitud de amistad'
      },
      responded_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de respuesta a la solicitud'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Estado activo de la relación'
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

    // Índices para friendships
    await queryInterface.addIndex('friendships', ['requester_id', 'addressee_id'], { 
      unique: true,
      name: 'idx_friendships_requester_addressee_unique' 
    });
    await queryInterface.addIndex('friendships', ['requester_id'], { name: 'idx_friendships_requester_id' });
    await queryInterface.addIndex('friendships', ['addressee_id'], { name: 'idx_friendships_addressee_id' });
    await queryInterface.addIndex('friendships', ['status'], { name: 'idx_friendships_status' });
    await queryInterface.addIndex('friendships', ['is_active'], { name: 'idx_friendships_is_active' });
    await queryInterface.addIndex('friendships', ['requested_at'], { name: 'idx_friendships_requested_at' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('friendships');
  }
};