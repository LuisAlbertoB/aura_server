// Configuración de base de datos para el Microservicio Social
// Adaptada del posts-service con nuevas tablas para UserProfile e Interest
require('dotenv').config();

const databaseConfig = {
  development: {
    // MySQL Development
    mysql: {
      username: process.env.DB_USER || 'social_user',
      password: process.env.DB_PASSWORD || 'social123',
      database: process.env.DB_NAME || 'social_dev_db',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      dialectOptions: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: console.log,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    },

    // PostgreSQL Development
    postgresql: {
      username: process.env.PG_USER || 'social_user',
      password: process.env.PG_PASSWORD || 'social123',
      database: process.env.PG_DATABASE || 'social_dev_db',
      host: process.env.PG_HOST || 'localhost',
      port: process.env.PG_PORT || 5432,
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.PG_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: console.log,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    },

    // SQLite Development
    sqlite: {
      dialect: 'sqlite',
      storage: process.env.SQLITE_PATH || './data/social_dev.db',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: console.log,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    }
  },

  test: {
    // MySQL Test
    mysql: {
      username: process.env.TEST_DB_USER || 'social_user',
      password: process.env.TEST_DB_PASSWORD || 'social123',
      database: process.env.TEST_DB_NAME || 'social_test_db',
      host: process.env.TEST_DB_HOST || 'localhost',
      port: process.env.TEST_DB_PORT || 3306,
      dialect: 'mysql',
      dialectOptions: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci'
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    },

    // SQLite Test
    sqlite: {
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    }
  },

  production: {
    // MySQL Production
    mysql: {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      dialectOptions: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        ssl: process.env.DB_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      pool: {
        max: 20,
        min: 5,
        acquire: 60000,
        idle: 30000
      },
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    },

    // PostgreSQL Production
    postgresql: {
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      host: process.env.PG_HOST,
      port: process.env.PG_PORT || 5432,
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.PG_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      pool: {
        max: 20,
        min: 5,
        acquire: 60000,
        idle: 30000
      },
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    }
  }
};

// Función para obtener configuración de BD basada en entorno y dialecto
function getDatabaseConfig(environment = null, dialect = null) {
  const env = environment || process.env.NODE_ENV || 'development';
  const dbDialect = dialect || process.env.DB_DIALECT || 'mysql';
  
  const config = databaseConfig[env];
  
  if (!config) {
    throw new Error(`Configuración de entorno '${env}' no encontrada`);
  }
  
  if (!config[dbDialect]) {
    throw new Error(`Configuración de dialecto '${dbDialect}' no encontrada para entorno '${env}'`);
  }
  
  return {
    ...config[dbDialect],
    environment: env,
    dialect: dbDialect
  };
}

// Función para obtener todas las configuraciones de un entorno
function getAllDatabaseConfigs(environment = null) {
  const env = environment || process.env.NODE_ENV || 'development';
  return databaseConfig[env] || {};
}

module.exports = {
  databaseConfig,
  getDatabaseConfig,
  getAllDatabaseConfigs,
  // Exportación para compatibilidad con Sequelize CLI
  development: databaseConfig.development.mysql,
  test: databaseConfig.test.mysql,
  production: databaseConfig.production.mysql
};