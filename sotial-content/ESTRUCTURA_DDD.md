# Nueva Estructura DDD para el Microservicio Social

```
social-service/
├── src/
│   ├── domain/                     # Capa de Dominio - Lógica de Negocio Pura
│   │   ├── aggregates/            # Agregados (Root Entities)
│   │   │   ├── UserProfile/
│   │   │   │   ├── UserProfile.js          # Agregado UserProfile
│   │   │   │   ├── entities/
│   │   │   │   │   └── Interest.js         # Entidad Interest
│   │   │   │   └── valueObjects/
│   │   │   │       ├── UserId.js           # Value Object UserId
│   │   │   │       └── Bio.js              # Value Object Bio
│   │   │   └── Publication/
│   │   │       ├── Publication.js          # Agregado Publication
│   │   │       ├── entities/
│   │   │       │   ├── Comment.js          # Entidad Comment
│   │   │       │   └── MediaItem.js       # Entidad MediaItem
│   │   │       └── valueObjects/
│   │   │           ├── PublicationId.js    # Value Object PublicationId
│   │   │           └── Content.js          # Value Object Content
│   │   ├── repositories/          # Interfaces de Repositorio
│   │   │   ├── IUserProfileRepository.js
│   │   │   └── IPublicationRepository.js
│   │   └── services/              # Servicios de Dominio
│   │       ├── UserProfileDomainService.js
│   │       └── PublicationDomainService.js
│   │
│   ├── application/               # Capa de Aplicación - Casos de Uso
│   │   ├── use-cases/
│   │   │   ├── userProfile/
│   │   │   │   ├── CreateUserProfileUseCase.js
│   │   │   │   ├── UpdateProfileUseCase.js
│   │   │   │   ├── AddFriendUseCase.js
│   │   │   │   ├── BlockUserUseCase.js
│   │   │   │   └── UpdateInterestsUseCase.js
│   │   │   └── publication/
│   │   │       ├── CreatePublicationUseCase.js
│   │   │       ├── AddCommentUseCase.js
│   │   │       ├── DeleteCommentUseCase.js
│   │   │       ├── LikePublicationUseCase.js
│   │   │       ├── UnlikePublicationUseCase.js
│   │   │       ├── AddMediaItemUseCase.js
│   │   │       └── RemoveMediaItemUseCase.js
│   │   ├── dtos/                  # Data Transfer Objects
│   │   │   ├── CreatePublicationDto.js
│   │   │   ├── CreateUserProfileDto.js
│   │   │   └── AddCommentDto.js
│   │   └── services/              # Servicios de Aplicación
│   │       ├── CloudinaryService.js
│   │       └── AuthService.js
│   │
│   ├── infrastructure/            # Capa de Infraestructura - Implementaciones
│   │   ├── repositories/          # Implementaciones de Repositorios
│   │   │   ├── SequelizeUserProfileRepository.js
│   │   │   └── SequelizePublicationRepository.js
│   │   ├── database/
│   │   │   ├── models/            # Modelos de Sequelize (migrados del original)
│   │   │   │   ├── index.js
│   │   │   │   ├── UserProfileModel.js    # Nuevo modelo
│   │   │   │   ├── InterestModel.js       # Nuevo modelo
│   │   │   │   ├── PostModel.js           # Post.js renombrado
│   │   │   │   ├── CommentModel.js        # Comment.js renombrado
│   │   │   │   ├── LikeModel.js           # Like.js renombrado
│   │   │   │   └── MediaModel.js          # Media.js renombrado
│   │   │   ├── migrations/        # Migraciones existentes + nuevas
│   │   │   └── config/
│   │   │       └── database.js
│   │   └── services/              # Servicios Externos
│   │       ├── CloudinaryServiceImpl.js
│   │       └── JWTService.js
│   │
│   ├── presentation/              # Capa de Presentación - Controladores y Rutas
│   │   ├── controllers/
│   │   │   ├── UserProfileController.js   # Controlador "tonto"
│   │   │   └── PublicationController.js   # Controlador "tonto"
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── userProfileRoutes.js
│   │   │   └── publicationRoutes.js
│   │   ├── middleware/            # Middlewares existentes
│   │   │   ├── authMiddleware.js
│   │   │   ├── validationMiddleware.js
│   │   │   ├── uploadMiddleware.js
│   │   │   ├── rateLimitMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   └── validators/            # Validadores de entrada
│   │       ├── UserProfileValidator.js
│   │       └── PublicationValidator.js
│   │
│   ├── shared/                    # Código Compartido
│   │   ├── errors/                # Errores de Dominio
│   │   │   ├── DomainError.js
│   │   │   ├── ValidationError.js
│   │   │   └── NotFoundError.js
│   │   ├── utils/
│   │   │   ├── Logger.js
│   │   │   └── Constants.js
│   │   └── IoC/                   # Inyección de Dependencias
│   │       └── Container.js
│   │
│   └── app.js                     # Punto de entrada principal
│
├── package.json
├── .env.example
├── docker-compose.yml
└── README.md
```

## Explicación de las Capas:

### 🏛️ **Domain (Dominio)**
- **Agregados**: UserProfile y Publication - Entidades raíz con lógica de negocio
- **Entidades**: Objetos con identidad (Interest, Comment, MediaItem)
- **Value Objects**: Objetos inmutables (UserId, Content, Bio)
- **Repositorios**: Interfaces para persistencia (sin implementación)

### 🎯 **Application (Aplicación)**
- **Casos de Uso**: Orquestación de la lógica de negocio
- **DTOs**: Objetos para transferir datos entre capas
- **Servicios de Aplicación**: Coordinación de casos de uso

### 🔧 **Infrastructure (Infraestructura)**
- **Repositorios**: Implementaciones con Sequelize
- **Modelos**: Modelos de base de datos (Sequelize)
- **Servicios Externos**: Cloudinary, JWT, etc.

### 🌐 **Presentation (Presentación)**
- **Controladores**: Solo orquestan llamadas a casos de uso
- **Rutas**: Definición de endpoints
- **Middlewares**: Autenticación, validación, etc.