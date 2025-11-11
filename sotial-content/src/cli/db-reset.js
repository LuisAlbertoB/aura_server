
const chalk = require('chalk');
const MigrationManager = require('../infrastructure/database/MigrationManager');

async function resetDatabase() {
  console.log(chalk.blue('🚀 Iniciando reseteo de la base de datos...'));

  const migrationManager = new MigrationManager();

  try {
    await migrationManager.initialize();

    const executedMigrations = await migrationManager.getExecutedMigrations();

    if (executedMigrations.length > 0) {
      console.log(chalk.yellow(`Revertiendo ${executedMigrations.length} migraciones...`));
      // Revertir en orden inverso
      for (let i = executedMigrations.length - 1; i >= 0; i--) {
        const migration = executedMigrations[i];
        await migrationManager.executeMigration(migration, 'down');
      }
      console.log(chalk.green('✅ Todas las migraciones han sido revertidas.'));
    } else {
      console.log(chalk.gray('No hay migraciones ejecutadas para revertir.'));
    }

    console.log(chalk.blue('\n🔄 Ejecutando todas las migraciones...'));
    await migrationManager.runPendingMigrations();

    console.log(chalk.green('\n✨ Reseteo de la base de datos completado exitosamente.'));

  } catch (error) {
    console.error(chalk.red('❌ Error durante el reseteo de la base de datos:'), error);
    process.exit(1);
  } finally {
    await migrationManager.close();
  }
}

resetDatabase();
