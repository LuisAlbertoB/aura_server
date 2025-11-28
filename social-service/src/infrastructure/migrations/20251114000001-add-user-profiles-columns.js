'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('➕ Agregando columna display_name a user_profiles...');
    
    try {
      // Agregar la columna display_name
      await queryInterface.addColumn('user_profiles', 'display_name', {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nombre a mostrar del usuario'
      });
      
      console.log('✅ Columna display_name agregada exitosamente');
      
      // También agregar username si no existe
      const tableDescription = await queryInterface.describeTable('user_profiles');
      if (!tableDescription.username) {
        console.log('➕ Agregando columna username a user_profiles...');
        await queryInterface.addColumn('user_profiles', 'username', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Nombre de usuario'
        });
        console.log('✅ Columna username agregada exitosamente');
      }
      
      // Agregar avatar_url si no existe  
      if (!tableDescription.avatar_url) {
        console.log('➕ Agregando columna avatar_url a user_profiles...');
        await queryInterface.addColumn('user_profiles', 'avatar_url', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'URL del avatar del usuario'
        });
        console.log('✅ Columna avatar_url agregada exitosamente');
      }
      
      console.log('🎉 Migración completada exitosamente');
      
    } catch (error) {
      console.error('❌ Error durante la migración:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('⬇️ Revirtiendo cambios en user_profiles...');
    
    try {
      await queryInterface.removeColumn('user_profiles', 'display_name');
      console.log('➖ Columna display_name eliminada');
      
      await queryInterface.removeColumn('user_profiles', 'username');
      console.log('➖ Columna username eliminada');
      
      await queryInterface.removeColumn('user_profiles', 'avatar_url');
      console.log('➖ Columna avatar_url eliminada');
      
      console.log('✅ Rollback completado');
    } catch (error) {
      console.error('❌ Error durante rollback:', error.message);
      // No fallar en rollback
    }
  }
};