// Sistema de migraciones para el Social Service
const { Sequelize } = require('sequelize');
// Función local para obtener configuración de BD
function getDatabaseConfig(environment = 'development', dialect = 'mysql') {
  return {
    dialect: dialect,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'posts_dev_db',
    username: process.env.DB_USER || 'posts_user',
    password: process.env.DB_PASSWORD || 'posts123',
    logging: environment === 'development' ? console.log : false,
    timezone: '+00:00',
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      underscored: true,
      freezeTableName: true
    }
  };
}
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

class MigrationManager {
  constructor(environment = null, dialect = null) {
    this.environment = environment || process.env.NODE_ENV || 'development';
    this.dialect = dialect || process.env.DB_DIALECT || 'mysql';
    this.config = getDatabaseConfig(this.environment, this.dialect);
    this.sequelize = new Sequelize(this.config);
    this.migrationsPath = path.join(__dirname, '../migrations');
    this.seedsPath = path.join(__dirname, '../seeds');
  }

  // Inicializar conexión y tablas de control
  async initialize() {
    try {
      await this.sequelize.authenticate();
      console.log(chalk.green(`✅ Conexión establecida con ${this.dialect} (${this.environment})`));
      
      // Crear tabla de migraciones si no existe
      await this.createMigrationsTable();
      return true;
    } catch (error) {
      console.error(chalk.red('❌ Error al conectar con la base de datos:'), error.message);
      return false;
    }
  }

  // Crear tabla para trackear migraciones
  async createMigrationsTable() {
    const tableName = 'SequelizeMeta';
    
    const query = this.dialect === 'sqlite' 
      ? `CREATE TABLE IF NOT EXISTS "${tableName}" (
          "name" VARCHAR(255) PRIMARY KEY
        )`
      : this.dialect === 'postgres'
      ? `CREATE TABLE IF NOT EXISTS "${tableName}" (
          "name" VARCHAR(255) PRIMARY KEY
        )`
      : `CREATE TABLE IF NOT EXISTS \`${tableName}\` (
          \`name\` VARCHAR(255) NOT NULL PRIMARY KEY
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`;
        
    await this.sequelize.query(query);
  }

  // Obtener migraciones ejecutadas
  async getExecutedMigrations() {
    try {
      const [results] = await this.sequelize.query(
        'SELECT name FROM SequelizeMeta ORDER BY name'
      );
      return results.map(row => row.name);
    } catch (error) {
      return [];
    }
  }

  // Obtener archivos de migraciones disponibles
  async getAvailableMigrations() {
    try {
      const files = await fs.readdir(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.js'))
        .sort();
    } catch (error) {
      return [];
    }
  }

  // Obtener migraciones pendientes
  async getPendingMigrations() {
    const executed = await this.getExecutedMigrations();
    const available = await this.getAvailableMigrations();
    
    return available.filter(migration => !executed.includes(migration));
  }

  // Ejecutar migración individual
  async executeMigration(migrationFile, direction = 'up') {
    const migrationPath = path.join(this.migrationsPath, migrationFile);
    
    try {
      const migration = require(migrationPath);
      
      if (!migration[direction]) {
        throw new Error(`Método '${direction}' no encontrado en migración ${migrationFile}`);
      }

      console.log(chalk.blue(`🔄 Ejecutando ${migrationFile} (${direction})...`));
      
      const queryInterface = this.sequelize.getQueryInterface();
      await migration[direction](queryInterface, Sequelize);
      
      if (direction === 'up') {
        // Registrar migración como ejecutada
        await this.sequelize.query(
          'INSERT INTO SequelizeMeta (name) VALUES (?)',
          { replacements: [migrationFile] }
        );
        console.log(chalk.green(`✅ Migración ${migrationFile} ejecutada exitosamente`));
      } else {
        // Remover migración del registro
        await this.sequelize.query(
          'DELETE FROM SequelizeMeta WHERE name = ?',
          { replacements: [migrationFile] }
        );
        console.log(chalk.yellow(`↩️  Migración ${migrationFile} revertida exitosamente`));
      }
      
      return true;
    } catch (error) {
      console.error(chalk.red(`❌ Error ejecutando migración ${migrationFile}:`), error.message);
      throw error;
    }
  }

  // Ejecutar todas las migraciones pendientes
  async runPendingMigrations() {
    const pendingMigrations = await this.getPendingMigrations();
    
    if (pendingMigrations.length === 0) {
      console.log(chalk.green('✅ No hay migraciones pendientes'));
      return true;
    }

    console.log(chalk.blue(`🚀 Ejecutando ${pendingMigrations.length} migraciones pendientes...`));
    
    for (const migration of pendingMigrations) {
      await this.executeMigration(migration, 'up');
    }
    
    console.log(chalk.green(`✅ Todas las migraciones ejecutadas correctamente`));
    return true;
  }

  // Revertir última migración
  async rollbackLastMigration() {
    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      console.log(chalk.yellow('⚠️  No hay migraciones para revertir'));
      return true;
    }

    const lastMigration = executedMigrations[executedMigrations.length - 1];
    await this.executeMigration(lastMigration, 'down');
    
    return true;
  }

  // Mostrar estado de migraciones
  async showMigrationStatus() {
    const executed = await this.getExecutedMigrations();
    const available = await this.getAvailableMigrations();
    const pending = await this.getPendingMigrations();

    console.log(chalk.blue('\n📋 Estado de Migraciones - Social Service:'));
    console.log(chalk.cyan(`Entorno: ${this.environment}`));
    console.log(chalk.cyan(`Base de datos: ${this.dialect}`));
    console.log(chalk.cyan(`Host: ${this.config.host || this.config.storage}\n`));

    if (executed.length > 0) {
      console.log(chalk.green('✅ Migraciones ejecutadas:'));
      executed.forEach(migration => {
        console.log(chalk.green(`   ✓ ${migration}`));
      });
    }

    if (pending.length > 0) {
      console.log(chalk.yellow('\n⏳ Migraciones pendientes:'));
      pending.forEach(migration => {
        console.log(chalk.yellow(`   ○ ${migration}`));
      });
    }

    if (executed.length === 0 && pending.length === 0) {
      console.log(chalk.gray('   No hay migraciones disponibles'));
    }

    console.log('');
  }

  // Generar nueva migración
  async generateMigration(name) {
    const timestamp = new Date().toISOString().replace(/[:-]/g, '').replace(/\..+/, '');
    const migrationName = `${timestamp}-${name}.js`;
    const migrationPath = path.join(this.migrationsPath, migrationName);

    const template = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Implementar migración aquí
    // Ejemplo:
    /*
    await queryInterface.createTable('example_table', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
    */
  },

  async down(queryInterface, Sequelize) {
    // Revertir migración aquí
    // Ejemplo:
    /*
    await queryInterface.dropTable('example_table');
    */
  }
};`;

    await fs.mkdir(this.migrationsPath, { recursive: true });
    await fs.writeFile(migrationPath, template);
    
    console.log(chalk.green(`✅ Migración creada: ${migrationName}`));
    console.log(chalk.blue(`📝 Edita el archivo: ${migrationPath}`));
    
    return migrationName;
  }

  // Ejecutar seeds
  async runSeeds() {
    try {
      const seedFiles = await fs.readdir(this.seedsPath);
      const seeds = seedFiles.filter(file => file.endsWith('.js')).sort();

      if (seeds.length === 0) {
        console.log(chalk.yellow('⚠️  No se encontraron archivos de seeds'));
        return true;
      }

      console.log(chalk.blue(`🌱 Ejecutando ${seeds.length} seeds...`));

      for (const seedFile of seeds) {
        const seedPath = path.join(this.seedsPath, seedFile);
        const seed = require(seedPath);

        if (seed.up) {
          console.log(chalk.blue(`🔄 Ejecutando seed: ${seedFile}`));
          const queryInterface = this.sequelize.getQueryInterface();
          await seed.up(queryInterface, Sequelize);
          console.log(chalk.green(`✅ Seed ${seedFile} ejecutado`));
        }
      }

      console.log(chalk.green('✅ Todos los seeds ejecutados correctamente'));
      return true;
    } catch (error) {
      console.error(chalk.red('❌ Error ejecutando seeds:'), error.message);
      throw error;
    }
  }

  // Cerrar conexión
  async close() {
    await this.sequelize.close();
  }
}

module.exports = MigrationManager;