const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const Container = require('./shared/IoC/Container');
const { errorHandler, notFoundHandler } = require('./infrastructure/middleware/errorMiddleware');
const { generalLimiter } = require('./infrastructure/middleware/rateLimitMiddleware');

class SocialServiceApp {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.container = Container;
  }

  async initialize() {
    try {
      // Inicializar base de datos
      await this.initializeDatabase();
      
      // Inicializar contenedor de dependencias
      this.container.initialize();
      
      // Configurar middlewares
      this.configureMiddlewares();
      
      // Configurar rutas
      this.configureRoutes();
      
      // Configurar manejo de errores
      this.configureErrorHandling();

      console.log(' Social Service App inicializada correctamente');
    } catch (error) {
      console.error(' Error al inicializar Social Service App:', error);
      throw error;
    }
  }

  async initializeDatabase() {
    try {
      const sequelize = require('./infrastructure/config/database');
      
      // Probar conexión
      await sequelize.authenticate();
      console.log(' Conexión a base de datos establecida');
      
      // Sincronizar modelos (solo en desarrollo)
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: false });
        console.log(' Modelos sincronizados');
      }
    } catch (error) {
      console.error(' Error al conectar con la base de datos:', error);
      throw error;
    }
  }

  configureMiddlewares() {
    // Seguridad
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // CORS - Configuración permisiva para desarrollo y testing
    this.app.use(cors({
      origin: function (origin, callback) {
        // Permitir requests sin origin (como Postman, Thunder Client)
        if (!origin) return callback(null, true);
        
        // Lista de orígenes permitidos
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:5500',
          'http://127.0.0.1:5500',
          'http://localhost:8080',
          'file://',
          'null'
        ];
        
        // Permitir cualquier localhost en desarrollo
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          console.log(' Origen bloqueado por CORS:', origin);
          callback(new Error('No permitido por CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      preflightContinue: false,
      optionsSuccessStatus: 200
    }));

    // Compresión
    this.app.use(compression());

    // Logging
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(morgan('combined'));
    }

    // Rate limiting
    this.app.use(generalLimiter);

    // Parsing
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Trust proxy para obtener IP real
    this.app.set('trust proxy', 1);
  }

  configureRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Social Service está funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // API routes - configuración manual de rutas con controladores
    const controllers = this.container.getControllers();
    
    // Rutas de Publications
    const express = require('express');
    const publicationRouter = express.Router();
    
    // GET /api/v1/publications (obtener todas las publicaciones)
    publicationRouter.get('/', controllers.publicationController.getPublications.bind(controllers.publicationController));
    // GET /api/v1/publications/:id (obtener publicación por ID)
    publicationRouter.get('/:id', controllers.publicationController.getPublicationById.bind(controllers.publicationController));
    // POST /api/v1/publications (crear nueva publicación)
    publicationRouter.post('/', controllers.publicationController.createPublication.bind(controllers.publicationController));
    // POST /api/v1/publications/:id/like (dar like)
    publicationRouter.post('/:id/like', controllers.publicationController.likePublication.bind(controllers.publicationController));
    // DELETE /api/v1/publications/:id/like (quitar like)
    publicationRouter.delete('/:id/like', controllers.publicationController.unlikePublication.bind(controllers.publicationController));
    // GET /api/v1/publications/:id/comments (obtener comentarios)
    publicationRouter.get('/:id/comments', controllers.publicationController.getComments.bind(controllers.publicationController));
    // POST /api/v1/publications/:id/comments (agregar comentario)
    publicationRouter.post('/:id/comments', controllers.publicationController.addComment.bind(controllers.publicationController));
    
    this.app.use('/api/v1/publications', publicationRouter);
    
    // Rutas de User Profiles
    const profileRouter = express.Router();
    
    // POST /api/v1/profiles
    profileRouter.post('/', controllers.userProfileController.createProfile.bind(controllers.userProfileController));
    // PUT /api/v1/profiles/:userId
    profileRouter.put('/:userId', controllers.userProfileController.updateProfile.bind(controllers.userProfileController));
    // POST /api/v1/profiles/:userId/friends
    profileRouter.post('/:userId/friends', controllers.userProfileController.addFriend.bind(controllers.userProfileController));
    // POST /api/v1/profiles/:userId/blocked-users
    profileRouter.post('/:userId/blocked-users', controllers.userProfileController.blockUser.bind(controllers.userProfileController));
    
    this.app.use('/api/v1/profiles', profileRouter);

    // Ruta de información de la API
    this.app.get('/api/v1', (req, res) => {
      res.json({
        success: true,
        message: 'Social Service API v1.0',
        version: '1.0.0',
        endpoints: {
          publications: '/api/v1/publications',
          profiles: '/api/v1/profiles',
          comments: '/api/v1/comments',
          likes: '/api/v1/likes'
        },
        documentation: '/api/v1/docs'
      });
    });
  }

  configureErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Error handler
    this.app.use(errorHandler);
  }

  start() {
    return new Promise((resolve) => {
      const server = this.app.listen(this.port, () => {
        console.log(` Social Service ejecutándose en puerto ${this.port}`);
        console.log(` Health check disponible en: http://localhost:${this.port}/health`);
        console.log(` API disponible en: http://localhost:${this.port}/api/v1`);
        console.log(` Entorno: ${process.env.NODE_ENV || 'development'}`);
        resolve(server);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        console.log(' Cerrando Social Service...');
        server.close(() => {
          console.log(' Social Service cerrado correctamente');
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        console.log(' Cerrando Social Service...');
        server.close(() => {
          console.log(' Social Service cerrado correctamente');
          process.exit(0);
        });
      });
    });
  }

  getApp() {
    return this.app;
  }
}

module.exports = SocialServiceApp;