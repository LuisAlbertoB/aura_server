'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('interests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_profile_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID del perfil de usuario',
        references: {
          model: 'user_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre del interés'
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Categoría del interés'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Estado activo del interés'
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

    // Índices para interests
    await queryInterface.addIndex('interests', ['user_profile_id'], { name: 'idx_interests_user_profile_id' });
    await queryInterface.addIndex('interests', ['name'], { name: 'idx_interests_name' });
    await queryInterface.addIndex('interests', ['category'], { name: 'idx_interests_category' });
    await queryInterface.addIndex('interests', ['is_active'], { name: 'idx_interests_is_active' });
    await queryInterface.addIndex('interests', ['user_profile_id', 'name'], { 
      unique: true,
      name: 'idx_interests_user_name_unique' 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('interests');
  }
};