require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configurar conexión usando las variables de entorno
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'posts_dev_db',
  username: process.env.DB_USER || 'posts_user',
  password: process.env.DB_PASSWORD || 'posts123',
  logging: console.log
});

async function setupMigrations() {
  try {
    console.log('🔄 Configurando migraciones existentes...');
    
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Crear tabla de migraciones si no existe
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`SequelizeMeta\` (
        \`name\` VARCHAR(255) NOT NULL PRIMARY KEY
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Verificar qué tablas existen
    const [tables] = await sequelize.query("SHOW TABLES");
    const existingTables = tables.map(row => Object.values(row)[0]);
    
    console.log('📋 Tablas existentes:', existingTables);

    // Marcar migraciones como ejecutadas si las tablas existen
    const migrationsToMark = [];
    
    if (existingTables.includes('posts')) {
      migrationsToMark.push('20251105000001-create-posts-table.js');
    }
    if (existingTables.includes('media')) {
      migrationsToMark.push('20251105000002-create-media-table.js');
    }
    if (existingTables.includes('comments')) {
      migrationsToMark.push('20251105000003-create-comments-table.js');
    }
    if (existingTables.includes('likes')) {
      migrationsToMark.push('20251105000004-create-likes-table.js');
    }

    // Insertar migraciones marcadas
    for (const migration of migrationsToMark) {
      try {
        await sequelize.query(
          'INSERT IGNORE INTO SequelizeMeta (name) VALUES (?)',
          { replacements: [migration] }
        );
        console.log(`✅ Marcada migración: ${migration}`);
      } catch (error) {
        console.log(`ℹ️  Migración ya marcada: ${migration}`);
      }
    }

    // Ahora ejecutar las nuevas migraciones (user_profiles, etc.)
    const newMigrations = [
      '20251105000005-create-user-profiles-table.js',
      '20251105000006-create-interests-table.js', 
      '20251105000007-create-friendships-table.js',
      '20251105000008-create-blocked-users-table.js'
    ];

    console.log('\n🚀 Ejecutando nuevas migraciones...');
    
    for (const migration of newMigrations) {
      try {
        // Verificar si la migración ya fue ejecutada
        const [rows] = await sequelize.query(
          'SELECT name FROM SequelizeMeta WHERE name = ?',
          { replacements: [migration] }
        );

        if (rows.length === 0) {
          console.log(`🔄 Ejecutando: ${migration}`);
          const migrationPath = `./src/infrastructure/migrations/${migration}`;
          const migrationModule = require(migrationPath);
          
          if (migrationModule.up) {
            const queryInterface = sequelize.getQueryInterface();
            await migrationModule.up(queryInterface, Sequelize);
            
            // Marcar como ejecutada
            await sequelize.query(
              'INSERT INTO SequelizeMeta (name) VALUES (?)',
              { replacements: [migration] }
            );
            console.log(`✅ Completada: ${migration}`);
          }
        } else {
          console.log(`ℹ️  Ya ejecutada: ${migration}`);
        }
      } catch (error) {
        console.error(`❌ Error en ${migration}:`, error.message);
      }
    }

    console.log('\n✅ Configuración de migraciones completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

setupMigrations();