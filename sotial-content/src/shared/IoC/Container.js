
// Importar repositorios (implementaciones de infraestructura)
const SequelizePublicationRepository = require('../../infrastructure/repositories/SequelizePublicationRepository');
const SequelizeUserProfileRepository = require('../../infrastructure/repositories/SequelizeUserProfileRepository');

// Importar casos de uso (capa de aplicación)
const CreatePublicationUseCase = require('../../application/use-cases/publication/CreatePublicationUseCase');
const GetPublicationsUseCase = require('../../application/use-cases/publication/GetPublicationsUseCase');
const GetPublicationByIdUseCase = require('../../application/use-cases/publication/GetPublicationByIdUseCase');
const { LikePublicationUseCase, UnlikePublicationUseCase } = require('../../application/use-cases/publication/LikePublicationUseCase');
const { AddCommentUseCase, DeleteCommentUseCase } = require('../../application/use-cases/publication/AddCommentUseCase');
const GetCommentsUseCase = require('../../application/use-cases/publication/GetCommentsUseCase');

// Casos de uso para UserProfile (versiones simplificadas)
const { AddFriendUseCase, RemoveFriendUseCase } = require('../../application/use-cases/userProfile/AddFriendUseCaseSimple');
const { BlockUserUseCase, UnblockUserUseCase } = require('../../application/use-cases/userProfile/BlockUserUseCaseSimple');
const { UpdateProfileUseCase, UpdateInterestsUseCase } = require('../../application/use-cases/userProfile/UpdateProfileUseCaseSimple');
const CreateUserProfileUseCase = require('../../application/use-cases/userProfile/CreateUserProfileUseCase');

// Importar controladores (capa de presentación)
const PublicationController = require('../../presentation/controllers/PublicationController');
const UserProfileController = require('../../presentation/controllers/UserProfileController');

// Importar servicios externos
const CloudinaryServiceImpl = require('../../infrastructure/services/CloudinaryServiceImpl');

class Container {
  constructor() {
    this._services = new Map();
    this._initialized = false;
  }

  /**
   * Inicializar todas las dependencias
   */
  initialize() {
    if (this._initialized) {
      return;
    }

    console.log('🏗️  Inicializando contenedor de dependencias...');

    // Marcar como inicializado antes de registrar servicios para evitar dependencia circular
    this._initialized = true;

    // 1. Registrar repositorios (capa de infraestructura)
    this._registerRepositories();
    
    // 2. Registrar servicios externos
    this._registerExternalServices();
    
    // 3. Registrar casos de uso (capa de aplicación)
    this._registerUseCases();
    
    // 4. Registrar controladores (capa de presentación)
    this._registerControllers();
    console.log('✅ Contenedor de dependencias inicializado');
  }

  /**
   * Obtener un servicio del contenedor
   */
  get(serviceName) {
    if (!this._initialized) {
      throw new Error('Container not initialized. Call initialize() first.');
    }

    const service = this._services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found in container`);
    }

    return service;
  }

  /**
   * Registrar repositorios
   */
  _registerRepositories() {
    console.log('📦 Registrando repositorios...');

    // Repositorio de publicaciones
    const publicationRepository = new SequelizePublicationRepository();
    this._services.set('publicationRepository', publicationRepository);

    // Repositorio de perfiles de usuario
    const userProfileRepository = new SequelizeUserProfileRepository();
    this._services.set('userProfileRepository', userProfileRepository);
  }

  /**
   * Registrar servicios externos
   */
  _registerExternalServices() {
    console.log('🌐 Registrando servicios externos...');

    // Servicio real de Cloudinary
    const cloudinaryService = new CloudinaryServiceImpl();
    this._services.set('cloudinaryService', cloudinaryService);
  }

  /**
   * Registrar casos de uso (inyección de dependencias aquí)
   */
  _registerUseCases() {
    console.log('🎯 Registrando casos de uso...');

    const publicationRepository = this.get('publicationRepository');
    const userProfileRepository = this.get('userProfileRepository');
    const cloudinaryService = this.get('cloudinaryService');

    // Casos de uso de Publication
    this._services.set('createPublicationUseCase', 
      new CreatePublicationUseCase(publicationRepository, cloudinaryService)
    );

    this._services.set('getPublicationsUseCase',
      new GetPublicationsUseCase(publicationRepository)
    );

    this._services.set('getPublicationByIdUseCase',
      new GetPublicationByIdUseCase(publicationRepository)
    );

    this._services.set('likePublicationUseCase',
      new LikePublicationUseCase(publicationRepository)
    );

    this._services.set('unlikePublicationUseCase',
      new UnlikePublicationUseCase(publicationRepository)
    );

    this._services.set('addCommentUseCase',
      new AddCommentUseCase(publicationRepository)
    );

    this._services.set('deleteCommentUseCase',
      new DeleteCommentUseCase(publicationRepository)
    );

    this._services.set('getCommentsUseCase',
      new GetCommentsUseCase(publicationRepository)
    );

    // Casos de uso de UserProfile (nuevas funcionalidades)
    this._services.set('createUserProfileUseCase',
      new CreateUserProfileUseCase(userProfileRepository)
    );

    this._services.set('updateProfileUseCase',
      new UpdateProfileUseCase(userProfileRepository)
    );

    this._services.set('updateInterestsUseCase',
      new UpdateInterestsUseCase(userProfileRepository)
    );

    this._services.set('addFriendUseCase',
      new AddFriendUseCase(userProfileRepository)
    );

    this._services.set('removeFriendUseCase',
      new RemoveFriendUseCase(userProfileRepository)
    );

    this._services.set('blockUserUseCase',
      new BlockUserUseCase(userProfileRepository)
    );

    this._services.set('unblockUserUseCase',
      new UnblockUserUseCase(userProfileRepository)
    );
  }

  /**
   * Registrar controladores (inyección de casos de uso)
   */
  _registerControllers() {
    console.log('🎮 Registrando controladores...');

    // Controlador de publicaciones
    const publicationController = new PublicationController(
      this.get('createPublicationUseCase'),
      this.get('getPublicationsUseCase'),
      this.get('getPublicationByIdUseCase'),
      this.get('likePublicationUseCase'),
      this.get('unlikePublicationUseCase'),
      this.get('addCommentUseCase'),
      this.get('deleteCommentUseCase'),
      this.get('getCommentsUseCase')
    );
    this._services.set('publicationController', publicationController);

    // Controlador de perfiles (nuevas funcionalidades)
    const userProfileController = new UserProfileController(
      this.get('createUserProfileUseCase'),
      this.get('updateProfileUseCase'),
      this.get('updateInterestsUseCase'),
      this.get('addFriendUseCase'),
      this.get('removeFriendUseCase'),
      this.get('blockUserUseCase'),
      this.get('unblockUserUseCase')
    );
    this._services.set('userProfileController', userProfileController);
  }

  /**
   * Obtener todos los controladores para las rutas
   */
  getControllers() {
    return {
      publicationController: this.get('publicationController'),
      userProfileController: this.get('userProfileController')
    };
  }

  /**
   * Limpiar el contenedor (para testing)
   */
  clear() {
    this._services.clear();
    this._initialized = false;
  }
}

// Singleton del contenedor
const container = new Container();

module.exports = container;
