'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blocked_users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      blocker_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID del usuario que bloquea'
      },
      blocked_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID del usuario bloqueado'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Razón del bloqueo'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Estado activo del bloqueo'
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

    // Índices para blocked_users
    await queryInterface.addIndex('blocked_users', ['blocker_id', 'blocked_id'], { 
      unique: true,
      name: 'idx_blocked_users_blocker_blocked_unique' 
    });
    await queryInterface.addIndex('blocked_users', ['blocker_id'], { name: 'idx_blocked_users_blocker_id' });
    await queryInterface.addIndex('blocked_users', ['blocked_id'], { name: 'idx_blocked_users_blocked_id' });
    await queryInterface.addIndex('blocked_users', ['is_active'], { name: 'idx_blocked_users_is_active' });
    await queryInterface.addIndex('blocked_users', ['created_at'], { name: 'idx_blocked_users_created_at' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('blocked_users');
  }
};