#!/usr/bin/env node

const { Sequelize } = require('sequelize');

async function runMigration() {
  try {
    console.log('🚀 Ejecutando migración para arreglar user_profiles...');

    const config = {
      dialect: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME || 'posts_dev_db',
      username: process.env.DB_USER || 'posts_user',
      password: process.env.DB_PASSWORD || 'posts123',
      logging: console.log
    };

    const db = new Sequelize(config);

    await db.authenticate();
    console.log('✅ Conexión a base de datos establecida');

    const queryInterface = db.getQueryInterface();

    console.log("🔍 Verificando estructura de tabla...");
    const table = await queryInterface.describeTable('user_profiles');

    const addColumnSafe = async (column, options) => {
      if (!table[column]) {
        await queryInterface.addColumn('user_profiles', column, options);
        console.log(`✅ ${column} agregado`);
      } else {
        console.log(`ℹ ${column} ya existe`);
      }
    };

    await addColumnSafe('display_name', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await addColumnSafe('username', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    await addColumnSafe('avatar_url', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await addColumnSafe('cover_url', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "URL de imagen de portada"
    });

    await addColumnSafe('location', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "Ubicación del usuario"
    });

    await addColumnSafe('website', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "Sitio web del usuario"
    });

    await addColumnSafe('bio', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: "Biografía del usuario - máximo 500 caracteres"
    });

    await addColumnSafe('birth_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: "Fecha de nacimiento en formato YYYY-MM-DD"
    });

    await addColumnSafe('gender', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: "Género del usuario"
    });

    await addColumnSafe('privacy_settings', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: "Configuración de privacidad del usuario"
    });

    await addColumnSafe('preferences', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: "Preferencias del usuario"
    });

    await addColumnSafe('followers_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Número de seguidores"
    });

    await addColumnSafe('following_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Número de usuarios seguidos"
    });

    await addColumnSafe('posts_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Número de publicaciones"
    });

    await addColumnSafe('is_verified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Cuenta verificada"
    });

    await addColumnSafe('is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "Cuenta activa"
    });

    await addColumnSafe('last_active_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "Última actividad del usuario"
    });

    await db.close();
    console.log('🎉 ¡Migración completada exitosamente!');

  } catch (e) {
    console.error('❌ Error ejecutando migración:', e);
    process.exit(1);
  }
}

runMigration();