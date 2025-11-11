'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_profiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        comment: 'ID único del usuario - referencia externa'
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Biografía del usuario'
      },
      avatar_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL del avatar del usuario'
      },
      cover_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL de la imagen de portada'
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Ubicación del usuario'
      },
      website: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Sitio web del usuario'
      },
      birth_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de nacimiento'
      },
      is_private: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Perfil privado o público'
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Usuario verificado'
      },
      friends_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Contador de amigos'
      },
      followers_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Contador de seguidores'
      },
      following_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Contador de seguidos'
      },
      posts_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Contador de publicaciones'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Estado activo del perfil'
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

    // Índices para user_profiles
    await queryInterface.addIndex('user_profiles', ['user_id'], { 
      unique: true,
      name: 'idx_user_profiles_user_id_unique' 
    });
    await queryInterface.addIndex('user_profiles', ['is_private'], { name: 'idx_user_profiles_is_private' });
    await queryInterface.addIndex('user_profiles', ['is_verified'], { name: 'idx_user_profiles_is_verified' });
    await queryInterface.addIndex('user_profiles', ['is_active'], { name: 'idx_user_profiles_is_active' });
    await queryInterface.addIndex('user_profiles', ['created_at'], { name: 'idx_user_profiles_created_at' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_profiles');
  }
};