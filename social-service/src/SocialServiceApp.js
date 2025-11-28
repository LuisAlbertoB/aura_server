const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const Container = require('./shared/IoC/Container');
const { errorHandler, notFoundHandler } = require('./infrastructure/middleware/errorMiddleware');
const { authMiddleware, optionalAuth } = require('./infrastructure/middleware/authMiddleware');
const { generalLimiter } = require('./infrastructure/middleware/rateLimitMiddleware');

class SocialServiceApp {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.container = Container;
  }

  async initialize() {
    try {
      await this.initializeDatabase();
      this.container.initialize();
      this.configureMiddlewares();
      this.configureRoutes();
      this.configureErrorHandling();
      console.log('✅ Social Service App inicializada correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar Social Service App:', error);
      throw error;
    }
  }

  async initializeDatabase() {
    try {
      const sequelize = require('./infrastructure/config/database');
      await sequelize.authenticate();
      console.log('✅ Conexión a base de datos establecida');
      
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: false });
        console.log('✅ Modelos sincronizados');
      }
    } catch (error) {
      console.error('❌ Error al conectar con la base de datos:', error);
      throw error;
    }
  }

  configureMiddlewares() {
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    this.app.use(cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:5500',
          'http://127.0.0.1:5500',
          'http://localhost:8080',
          'file://',
          'null'
        ];
        
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          console.log('❌ Origen bloqueado por CORS:', origin);
          callback(new Error('No permitido por CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      preflightContinue: false,
      optionsSuccessStatus: 200
    }));

    this.app.use(compression());

    if (process.env.NODE_ENV !== 'test') {
      this.app.use(morgan('combined'));
    }

    this.app.use(generalLimiter);
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    const path = require('path');
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    console.log('📁 Sirviendo archivos estáticos desde /uploads');

    this.app.set('trust proxy', 1);
  }

  configureRoutes() {
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Social Service está funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    const controllers = this.container.getControllers();
    const express = require('express');
    const upload = require('./config/multer');
    
    // Publications Router
    const publicationRouter = express.Router();
    publicationRouter.get('/', optionalAuth, controllers.publicationController.getPublications.bind(controllers.publicationController));
    publicationRouter.get('/:id', optionalAuth, controllers.publicationController.getPublicationById.bind(controllers.publicationController));
    publicationRouter.post('/', authMiddleware, upload.any(), controllers.publicationController.createPublication.bind(controllers.publicationController));
    publicationRouter.post('/:id/like', authMiddleware, controllers.publicationController.likePublication.bind(controllers.publicationController));
    publicationRouter.delete('/:id/like', authMiddleware, controllers.publicationController.unlikePublication.bind(controllers.publicationController));
    publicationRouter.get('/:id/comments', controllers.publicationController.getComments.bind(controllers.publicationController));
    publicationRouter.post('/:id/comments', authMiddleware, controllers.publicationController.addComment.bind(controllers.publicationController));
    this.app.use('/api/v1/publications', publicationRouter);
    
    // Profile Router - CORREGIDO CON MULTER
    const profileRouter = express.Router();
    
    // GET /api/v1/profiles/:userId - Obtener perfil por ID
    profileRouter.get('/:userId', 
      authMiddleware, 
      controllers.userProfileController.getProfileByUserId.bind(controllers.userProfileController)
    );
    
    // POST /api/v1/profiles - Crear perfil con avatar
    // ✅ AGREGADO: upload.single('avatar') para manejar el archivo
    profileRouter.post('/', 
      authMiddleware,
      upload.single('avatar'),
      (req, res, next) => {
        console.log('📝 Middleware Debug - Body:', req.body);
        console.log('📝 Middleware Debug - File:', req.file);
        next();
      },
      controllers.userProfileController.createProfile.bind(controllers.userProfileController)
    );
    
    // POST /api/v1/profiles/friends
    profileRouter.post('/friends', 
      authMiddleware, 
      controllers.userProfileController.addFriend.bind(controllers.userProfileController)
    );
    
    // POST /api/v1/profiles/blocked-users
    profileRouter.post('/blocked-users', 
      authMiddleware, 
      controllers.userProfileController.blockUser.bind(controllers.userProfileController)
    );
    
    // POST /api/v1/profiles/json - Crear perfil sin archivo (JSON puro)
    const { validateProfileData } = require('./infrastructure/middleware/profileValidationMiddleware');
    profileRouter.post('/json', 
      authMiddleware, 
      ...validateProfileData, 
      controllers.userProfileController.createProfile.bind(controllers.userProfileController)
    );
    
    this.app.use('/api/v1/profiles', profileRouter);

    // Importar rutas adicionales
    const profileRoutes = require('./presentation/routes/profileRoutes');
    const communityRoutes = require('./presentation/routes/communityRoutes');
    const preferencesRoutes = require('./presentation/routes/preferencesRoutes');
    const completeProfileRoutes = require('./presentation/routes/completeProfileRoutes');
    const friendshipRoutes = require('./presentation/routes/friendshipRoutes');

    this.app.use('/api/v1', profileRoutes);
    this.app.use('/api/v1/communities', communityRoutes);
    this.app.use('/api/v1/preferences', preferencesRoutes);
    this.app.use('/api/v1/complete-profile', completeProfileRoutes);
    this.app.use('/api/v1/friendships', friendshipRoutes);

    this.app.get('/api/v1', (req, res) => {
      res.json({
        success: true,
        message: 'Social Service API v1.0',
        version: '1.0.0',
        endpoints: {
          publications: '/api/v1/publications',
          profiles: '/api/v1/profiles',
          communities: '/api/v1/communities',
          preferences: '/api/v1/preferences',
          completeProfile: '/api/v1/complete-profile',
          friendships: '/api/v1/friendships',
          comments: '/api/v1/comments',
          likes: '/api/v1/likes'
        },
        documentation: '/api/v1/docs'
      });
    });
  }

  configureErrorHandling() {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  start() {
    return new Promise((resolve) => {
      const server = this.app.listen(this.port, () => {
        console.log(`✅ Social Service ejecutándose en puerto ${this.port}`);
        console.log(`✅ Health check disponible en: http://localhost:${this.port}/health`);
        console.log(`✅ API disponible en: http://localhost:${this.port}/api/v1`);
        console.log(`✅ Entorno: ${process.env.NODE_ENV || 'development'}`);
        resolve(server);
      });

      process.on('SIGTERM', () => {
        console.log('⏹️ Cerrando Social Service...');
        server.close(() => {
          console.log('✅ Social Service cerrado correctamente');
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        console.log('⏹️ Cerrando Social Service...');
        server.close(() => {
          console.log('✅ Social Service cerrado correctamente');
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