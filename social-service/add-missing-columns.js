const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
const config = {
  dialect: process.env.DB_DIALECT || 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'posts_dev_db',
  username: process.env.DB_USER || 'posts_user',
  password: process.env.DB_PASSWORD || 'Posts123!',
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
};

async function addMissingColumns() {
  const sequelize = new Sequelize(config.database, config.username, config.password, config);

  try {
    console.log('🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Verificar si las columnas existen antes de crearlas
    console.log('🔍 Verificando columnas existentes en user_profiles...');
    
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${config.database}' 
      AND TABLE_NAME = 'user_profiles'
    `);

    const existingColumns = results.map(row => row.COLUMN_NAME);
    console.log('📋 Columnas existentes:', existingColumns);

    // Columnas que queremos agregar
    const columnsToAdd = [
      { name: 'display_name', sql: 'ADD COLUMN display_name VARCHAR(100) NULL' },
      { name: 'username', sql: 'ADD COLUMN username VARCHAR(50) NULL' },
      { name: 'avatar_url', sql: 'ADD COLUMN avatar_url VARCHAR(500) NULL' }
    ];

    console.log('🏗️ Agregando columnas faltantes...');

    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`  ➕ Agregando columna: ${column.name}`);
        try {
          await sequelize.query(`ALTER TABLE user_profiles ${column.sql}`);
          console.log(`  ✅ Columna ${column.name} agregada exitosamente`);
        } catch (error) {
          console.log(`  ⚠️ Error agregando ${column.name}:`, error.message);
        }
      } else {
        console.log(`  ⏭️ Columna ${column.name} ya existe`);
      }
    }

    // Verificar el resultado final
    console.log('🔍 Verificando columnas finales...');
    const [finalResults] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${config.database}' 
      AND TABLE_NAME = 'user_profiles'
    `);

    const finalColumns = finalResults.map(row => row.COLUMN_NAME);
    console.log('📋 Columnas finales:', finalColumns);

    console.log('✅ Proceso completado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  addMissingColumns();
}

module.exports = addMissingColumns;