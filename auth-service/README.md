# Auth Service Microservice

Este microservicio forma parte de una arquitectura de microservicios más grande, `aura_server`. Su objetivo principal es gestionar la autenticación y autorización de usuarios, proporcionando funcionalidades para el registro, inicio de sesión, y gestión básica de perfiles.

## 🚀 Stack Tecnológico

*   **Entorno de ejecución:** Node.js
*   **Framework Web:** Express.js
*   **Base de Datos:** PostgreSQL
*   **ORM:** Prisma
*   **Hash de Contraseñas:** Bcrypt.js
*   **Tokens de Autenticación:** JSON Web Tokens (JWT)
*   **Validación de Entrada:** Express-validator, Validator.js
*   **Seguridad:** Helmet, CORS
*   **Logging:** Morgan
*   **Herramienta de Pruebas:** Postman

## 📁 Estructura del Proyecto
.
└── auth-service
├── index.js
├── package.json
├── package-lock.json
├── .env
└── src
├── controllers
│ └── authController.js
├── middlewares
│ ├── authMiddleware.js
│ └── validationMiddleware.js
├── models
│ └── (generado por Prisma, ej. node_modules/@prisma/client/index.d.ts)
└── routes
└── authRoutes.js
code
Code
## 📝 Modelos/Entidades de la Base de Datos

### `roles`

| Campo      | Tipo                           | Descripción                                     |
| :--------- | :----------------------------- | :---------------------------------------------- |
| `id_role`  | `SERIAL` (PK)                  | Identificador único del rol.                    |
| `role_name`| `VARCHAR(50)` (UNIQUE, NOT NULL)| Nombre del rol (ej. 'admin', 'user').           |
| `created_at`| `TIMESTAMP WITH TIME ZONE`   | Marca de tiempo de creación del rol.            |

### `users`

| Campo         | Tipo                             | Descripción                                     |
| :------------ | :------------------------------- | :---------------------------------------------- |
| `user_id`     | `UUID` (PK, DEFAULT gen_random_uuid())| Identificador único del usuario.                 |
| `username`    | `VARCHAR(100)` (UNIQUE, NOT NULL)| Nombre de usuario único.                         |
| `email`       | `VARCHAR(100)` (UNIQUE, NOT NULL)| Correo electrónico único del usuario.           |
| `password_hash`| `VARCHAR(255)` (NOT NULL)       | Hash de la contraseña del usuario (Bcrypt).     |
| `id_role`     | `INTEGER` (FK)                   | ID del rol al que pertenece el usuario.         |
| `created_at`  | `TIMESTAMP WITH TIME ZONE`       | Marca de tiempo de creación del usuario.        |

## 🛠️ Configuración y Ejecución

1.  **Clonar el repositorio (si aplica) y navegar:**

    ```bash
    git clone <tu_repo_url>
    cd aura_server/auth-service
    ```

2.  **Configurar PostgreSQL:**
    Asegúrate de tener una instancia de PostgreSQL en funcionamiento. Crea la base de datos `aura_auth_db` y las tablas `roles` y `users` utilizando el script SQL proporcionado o generando las migraciones con Prisma.

    ```sql
    -- Ejemplo de creación de DB y tablas (en psql)
    CREATE DATABASE aura_auth_db;
    \c aura_auth_db

    CREATE TABLE roles (
        id_role SERIAL PRIMARY KEY,
        role_name VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO roles (role_name) VALUES ('admin'), ('user');

    CREATE TABLE users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        id_role INTEGER NOT NULL DEFAULT (SELECT id_role FROM roles WHERE role_name = 'user'),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_role
            FOREIGN KEY (id_role)
            REFERENCES roles (id_role)
            ON DELETE RESTRICT
    );
    ```

3.  **Instalar dependencias:**

    ```bash
    npm install
    ```

4.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del microservicio (`auth-service/`) con el siguiente contenido, reemplazando los valores `your_...` con tus propias credenciales y claves secretas:

    ```env
    DATABASE_URL="postgresql://your_username:your_password@localhost:5432/aura_auth_db?schema=public"
    JWT_SECRET="your_very_long_and_complex_jwt_secret_key"
    PORT=3001
    ```

5.  **Generar Cliente Prisma:**

    ```bash
    npx prisma generate
    ```

6.  **Iniciar el servidor:**

    *   **Modo desarrollo (con `nodemon`):**
        ```bash
        npm run dev
        ```
    *   **Modo producción:**
        ```bash
        npm start
        ```

    El servicio estará disponible en `http://localhost:3001`.

## 🌐 Endpoints

Todos los endpoints están prefijados con `/api/auth`.

| Método | Endpoint         | Descripción                                                                                | Autenticación  | Autorización |
| :----- | :--------------- | :----------------------------------------------------------------------------------------- | :------------- | :----------- |
| `POST` | `/api/auth/register`| Registra un nuevo usuario en el sistema.                                                   | No             | Cualquiera   |
| `POST` | `/api/auth/login` | Autentica a un usuario y devuelve un token JWT.                                            | No             | Cualquiera   |
| `GET`  | `/api/auth/profile`| Obtiene el perfil del usuario autenticado.                                                 | JWT            | Usuario      |
| `GET`  | `/api/auth/users` | Obtiene la lista de todos los usuarios (solo para administradores).                        | JWT            | Admin        |

## 🔒 Validaciones y Seguridad Implementadas

Este microservicio implementa un conjunto robusto de validaciones y medidas de seguridad siguiendo las mejores prácticas:

### 2. Validación del Lado del Servidor

*   **Validación de Autenticidad**: [Ver `authMiddleware.js`, `verifyToken`] Se verifica la autenticidad del token JWT recibido para asegurar que la petición proviene de un usuario legítimo.
*   **Validación de Consistencia**: [Ver `authController.js`, `register`] Antes de registrar un nuevo usuario, se verifica que el correo electrónico y el nombre de usuario no existan previamente en la base de datos.
*   **Validación de Integridad**: [Ver `authMiddleware.js`, `verifyToken`] La verificación del token JWT comprueba que no haya sido alterado durante la transmisión.
*   **Validación de Permisos**: [Ver `authMiddleware.js`, `authorizeRole`] Se implementa un middleware (`authorizeRole`) para restringir el acceso a ciertos endpoints basándose en el rol del usuario (ej., `'/api/auth/users'` solo para 'admin').

### 3. Validación de Tipo

*   [Ver `validationMiddleware.js`, `registerValidation`, `loginValidation`] Se utilizan `express-validator` y `validator.js` para asegurar que los datos ingresados (ej., `email`, `password`, `username`) corresponden al tipo esperado (ej., `isEmail`, `isLength`).

### 5. Validación de Patrones y Reglas Específicas

*   **Direcciones de Correo Electrónico**: [Ver `validationMiddleware.js`, `registerValidation`, `loginValidation`] Se utiliza `isEmail()` para verificar el formato del correo electrónico.
*   **Contraseñas Fuertes**: [Ver `validationMiddleware.js`, `registerValidation`] Se aplican reglas estrictas para la longitud mínima y la inclusión de mayúsculas, minúsculas, números y caracteres especiales.
*   **Nombres de Usuario**: [Ver `validationMiddleware.js`, `registerValidation`] Se valida un patrón (`/^[a-zA-Z0-9_]+$/`) para asegurar que el nombre de usuario solo contenga caracteres permitidos.

### 8. Sanitización de Entrada

La sanitización se aplica para neutralizar contenido malicioso en los datos de entrada:

*   **a. Escapado de Caracteres**:
    *   **HTML Escaping**: [Ver `validationMiddleware.js`, `registerValidation`, `loginValidation`, `escape()`] Se usa `escape()` de `express-validator` para convertir caracteres HTML especiales a sus entidades correspondientes, previniendo ataques XSS.
    *   **JavaScript Escaping**: [Ver `validationMiddleware.js`, `sanitizeInput`, `validator.escape()`] Se aplica para escapar caracteres que podrían ser interpretados como código JavaScript.
    *   **SQL Escaping**: [Ver `validationMiddleware.js`, `sanitizeInput`, `validator.blacklist()`] Aunque Prisma ORM ya previene inyecciones SQL, se incluye un ejemplo de `blacklist()` como medida adicional en caso de inputs no controlados por el ORM.
*   **c. Validación de Tipo de Datos**:
    *   **Tipos Primitivos**: [Ver `validationMiddleware.js`] `express-validator` asegura que los datos sean del tipo correcto (ej., `isEmail` verifica que sea una cadena con formato de email).
    *   **Estructuras de Datos**: `express.json()` se encarga de parsear JSON, y las validaciones posteriores confirman el formato esperado de los campos dentro del JSON.
*   **f. Uso de Funciones y Librerías Seguras**:
    *   **ORMs (Object-Relational Mappers)**: [Ver `authController.js`, `prisma`] Se utiliza Prisma ORM para todas las interacciones con la base de datos, lo que proporciona una protección inherente contra la mayoría de los ataques de inyección SQL.
    *   **Librerías de Escapado**: [Ver `validationMiddleware.js`] Se utiliza `express-validator` y `validator.js`, librerías que implementan funciones de sanitización y validación seguras y actualizadas.
*   **h. Canonicalización**:
    *   **Normalización de Email**: [Ver `validationMiddleware.js`, `normalizeEmail()`] Se usa `normalizeEmail()` para convertir los correos electrónicos a un formato estándar, evitando diferentes representaciones del mismo valor.
*   **j. Revisiones y Auditorías de Código**:
    *   **Código Estático**: Se recomienda el uso de herramientas de análisis de código estático (ESLint, SonarQube) para detectar vulnerabilidades en tiempo de desarrollo. (No implementado directamente en el código base, pero es una práctica recomendada).
    *   **Pruebas de Penetración**: Se recomienda realizar pruebas de penetración regulares para identificar y corregir debilidades en la sanitización de entradas y otras áreas de seguridad. (No implementado directamente en el código base, pero es una práctica recomendada).

### 9. Uso de Librerías y Frameworks de Validación

*   [Ver `package.json`, `express-validator`, `validator`] Se emplean `express-validator` y `validator.js`, que son librerías de validación bien mantenidas y ampliamente utilizadas en el ecosistema de Node.js, incorporando las mejores prácticas de seguridad.

### 11. Gestión de Errores Adecuada

*   [Ver `authController.js`, `validationMiddleware.js`, `index.js`] Los errores de validación y los errores internos del servidor se manejan de manera que no revelen información sensible que pueda ser explotada por atacantes. Los mensajes de error son genéricos para evitar dar pistas sobre la lógica interna o la existencia de usuarios/emails. Se incluye un middleware de manejo de errores global en `index.js`.

## 🧪 Pruebas (Postman)

Puedes usar Postman para probar los endpoints:

### Registrar Usuario (`POST /api/auth/register`)

**Headers:**
`Content-Type: application/json`

**Body (raw JSON):**

```json
{
    "username": "testuser",
    "email": "test@example.com",
    "password": "StrongPassword123!"
}
Iniciar Sesión (POST /api/auth/login)
Headers:
Content-Type: application/json
Body (raw JSON):
code
JSON
{
    "email": "test@example.com",
    "password": "StrongPassword123!"
}
Respuesta exitosa contendrá un token.
Obtener Perfil (GET /api/auth/profile)
Headers:
Authorization: Bearer <your_jwt_token> (Reemplaza <your_jwt_token> con el token obtenido del login)
Obtener Todos los Usuarios (GET /api/auth/users)
Para un usuario 'admin':
Crea un usuario con el rol 'admin' directamente en la base de datos (o modifica un usuario existente).
code
SQL
UPDATE users SET id_role = (SELECT id_role FROM roles WHERE role_name = 'admin') WHERE email = 'admin@example.com';
Inicia sesión con ese usuario 'admin' para obtener un token.
Usa el token del admin en el header: Authorization: Bearer <admin_jwt_token>
Para un usuario 'user':
Si intentas acceder con un token de un usuario con rol 'user', recibirás un 403 Forbidden.