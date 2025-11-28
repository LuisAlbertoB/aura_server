'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create communities table
    await queryInterface.createTable('communities', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      creator_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID del usuario que creó la comunidad'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre de la comunidad'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de la comunidad'
      },
      category: {
        type: Sequelize.ENUM(
          'Deportes', 'Arte', 'Musica', 'Lectura', 'Tecnologia', 
          'Naturaleza', 'Voluntariado', 'Gaming', 'Fotografia', 
          'Cocina', 'Baile', 'Meditacion'
        ),
        allowNull: false,
        comment: 'Categoría de la comunidad'
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Etiquetas de la comunidad (ej: Todas las edades, presencial, en linea, hibrido)'
      },
      community_image_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL de la imagen de la comunidad'
      },
      members_count: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        comment: 'Cantidad de miembros'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si la comunidad está activa'
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

    // 2. Create user_preferences table
    await queryInterface.createTable('user_preferences', {
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
        comment: 'ID del usuario'
      },
      preferences: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
        comment: 'Array de preferencias del usuario'
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

    // 3. Create complete_profiles table
    await queryInterface.createTable('complete_profiles', {
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
        comment: 'ID del usuario'
      },
      full_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nombre completo'
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Edad del usuario'
      },
      profile_picture: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL de la foto de perfil'
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción breve del usuario'
      },
      hobbies: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Hobbies principales del usuario'
      },
      location: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Ubicación del usuario'
      },
      website: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Sitio web personal'
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Número de teléfono'
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

    // 4. Create friendships table
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
        comment: 'ID del usuario que envía la solicitud'
      },
      addressee_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID del usuario que recibe la solicitud'
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'rejected', 'blocked'),
        defaultValue: 'pending',
        comment: 'Estado de la amistad'
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

    // 5. Create community_members table (many-to-many)
    await queryInterface.createTable('community_members', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      community_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'communities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'ID del usuario miembro'
      },
      role: {
        type: Sequelize.ENUM('creator', 'admin', 'moderator', 'member'),
        defaultValue: 'member',
        comment: 'Rol del usuario en la comunidad'
      },
      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('communities', ['creator_id']);
    await queryInterface.addIndex('communities', ['category']);
    await queryInterface.addIndex('communities', ['is_active']);
    
    await queryInterface.addIndex('user_preferences', ['user_id']);
    
    await queryInterface.addIndex('complete_profiles', ['user_id']);
    
    await queryInterface.addIndex('friendships', ['requester_id']);
    await queryInterface.addIndex('friendships', ['addressee_id']);
    await queryInterface.addIndex('friendships', ['status']);
    await queryInterface.addIndex('friendships', ['requester_id', 'addressee_id'], { unique: true });
    
    await queryInterface.addIndex('community_members', ['community_id']);
    await queryInterface.addIndex('community_members', ['user_id']);
    await queryInterface.addIndex('community_members', ['community_id', 'user_id'], { unique: true });

    console.log('✅ Migración completada: communities, user_preferences, complete_profiles, friendships, community_members');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('community_members');
    await queryInterface.dropTable('friendships');
    await queryInterface.dropTable('complete_profiles');
    await queryInterface.dropTable('user_preferences');
    await queryInterface.dropTable('communities');
    
    console.log('✅ Rollback completado: Tablas eliminadas');
  }
};