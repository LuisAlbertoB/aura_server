#!/usr/bin/env node

// CLI para manejo de migraciones del Social Service
const yargs = require('yargs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const MigrationManager = require('../infrastructure/database/MigrationManager');

// Configurar yargs
const argv = yargs
  .usage('Uso: $0 <comando> [opciones]')
  .command('create [name]', 'Crear nueva migración', (yargs) => {
    return yargs.positional('name', {
      describe: 'Nombre de la migración',
      type: 'string'
    });
  })
  .command('up', 'Ejecutar migraciones pendientes')
  .command('down', 'Revertir última migración')
  .command('status', 'Mostrar estado de migraciones')
  .command('seed', 'Ejecutar seeds')
  .command('setup', 'Configuración inicial interactiva')
  .option('env', {
    alias: 'e',
    describe: 'Entorno de ejecución',
    choices: ['development', 'test', 'production'],
    default: process.env.NODE_ENV || 'development'
  })
  .option('dialect', {
    alias: 'd',
    describe: 'Dialecto de base de datos',
    choices: ['mysql', 'postgresql', 'sqlite'],
    default: process.env.DB_DIALECT || 'mysql'
  })
  .option('interactive', {
    alias: 'i',
    describe: 'Modo interactivo',
    type: 'boolean',
    default: false
  })
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .argv;

// Función principal
async function main() {
  try {
    console.log(chalk.blue('🏗️  Social Service - Migration Manager\n'));

    const command = argv._[0];
    let environment = argv.env;
    let dialect = argv.dialect;

    // Modo interactivo
    if (argv.interactive || command === 'setup') {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'environment',
          message: 'Selecciona el entorno:',
          choices: ['development', 'test', 'production'],
          default: environment
        },
        {
          type: 'list',
          name: 'dialect',
          message: 'Selecciona el tipo de base de datos:',
          choices: ['mysql', 'postgresql', 'sqlite'],
          default: dialect
        }
      ]);

      environment = answers.environment;
      dialect = answers.dialect;

      if (command === 'setup') {
        await showSetupGuide(environment, dialect);
        return;
      }
    }

    const migrationManager = new MigrationManager(environment, dialect);
    
    // Inicializar conexión
    const connected = await migrationManager.initialize();
    if (!connected) {
      process.exit(1);
    }

    // Ejecutar comando
    switch (command) {
      case 'create':
        await handleCreateMigration(migrationManager, argv.name);
        break;

      case 'up':
        await migrationManager.runPendingMigrations();
        break;

      case 'down':
        await migrationManager.rollbackLastMigration();
        break;

      case 'status':
        await migrationManager.showMigrationStatus();
        break;

      case 'seed':
        await migrationManager.runSeeds();
        break;

      default:
        console.log(chalk.yellow('⚠️  Comando no reconocido. Usa --help para ver comandos disponibles.'));
        yargs.showHelp();
        break;
    }

    await migrationManager.close();
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  }
}

// Manejar creación de migración
async function handleCreateMigration(migrationManager, name) {
  let migrationName = name;

  if (!migrationName) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Nombre de la migración:',
        validate: (input) => {
          if (!input.trim()) {
            return 'El nombre de la migración es requerido';
          }
          return true;
        }
      }
    ]);
    migrationName = answer.name;
  }

  await migrationManager.generateMigration(migrationName);
}

// Mostrar guía de configuración
async function showSetupGuide(environment, dialect) {
  console.log(chalk.green('🚀 Guía de Configuración Social Service\n'));
  
  console.log(chalk.cyan('Configuración seleccionada:'));
  console.log(`   Entorno: ${chalk.yellow(environment)}`);
  console.log(`   Base de datos: ${chalk.yellow(dialect)}\n`);

  console.log(chalk.blue('📋 Variables de entorno necesarias:\n'));

  if (dialect === 'mysql') {
    console.log(chalk.gray('# MySQL Configuration'));
    console.log(`DB_DIALECT=mysql`);
    console.log(`DB_HOST=localhost`);
    console.log(`DB_PORT=3306`);
    console.log(`DB_NAME=posts_dev_db`);
    console.log(`DB_USER=posts_user`);
    console.log(`DB_PASSWORD=posts123`);
    
    if (environment === 'production') {
      console.log(`DB_SSL=false`);
    }
  }

  console.log(`\nNODE_ENV=${environment}`);
  console.log(`PORT=3001`);
  console.log(`JWT_SECRET=your-jwt-secret-key`);
  console.log(`\n# Cloudinary Configuration`);
  console.log(`CLOUDINARY_CLOUD_NAME=your-cloud-name`);
  console.log(`CLOUDINARY_API_KEY=your-api-key`);
  console.log(`CLOUDINARY_API_SECRET=your-api-secret\n`);

  console.log(chalk.blue('🔧 Comandos útiles:\n'));
  console.log(`   Crear migración:     ${chalk.green('npm run migrate:create')}`);
  console.log(`   Ejecutar migraciones: ${chalk.green('npm run migrate:up')}`);
  console.log(`   Revertir migración:   ${chalk.green('npm run migrate:down')}`);
  console.log(`   Ver estado:          ${chalk.green('npm run migrate:status')}`);
  console.log(`   Ejecutar seeds:      ${chalk.green('npm run seed')}\n`);

  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'runMigrations',
      message: '¿Deseas ejecutar las migraciones ahora?',
      default: true
    }
  ]);

  if (answer.runMigrations) {
    console.log(chalk.blue('\n🔄 Ejecutando migraciones...\n'));
    const migrationManager = new MigrationManager(environment, dialect);
    const connected = await migrationManager.initialize();
    
    if (connected) {
      await migrationManager.runPendingMigrations();
      await migrationManager.close();
    }
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main };