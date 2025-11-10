# Auth Service Microservice

Este microservicio es un componente central de la arquitectura `aura_server`, diseñado para gestionar de forma segura la autenticación y autorización de usuarios. Proporciona funcionalidades clave como registro, inicio de sesión y gestión de perfiles, utilizando un stack tecnológico moderno y robusto.

## 🚀 Stack Tecnológico

*   **Entorno de ejecución:** Node.js
*   **Framework:** Express.js
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
```
```

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

Este microservicio está diseñado para ser desplegado fácilmente con Docker, gestionado por el script `setup.sh` en la raíz del proyecto `aura_server`. Este script automatiza la creación de los Dockerfiles, el archivo `docker-compose.yml` y la configuración inicial de la base de datos.

1.  **Requisitos Previos:**
    *   Docker y Docker Compose deben estar instalados. El script `setup.sh` puede instalarlos si no los detecta.

2.  **Instalar dependencias (si se ejecuta localmente fuera de Docker):**

    ```bash
    npm install
    ```

3.  **Configurar variables de entorno (para ejecución local):**
    Crea un archivo `.env` en la raíz del microservicio (`auth-service/`) con el siguiente contenido, reemplazando los valores `your_...` con tus propias credenciales y claves secretas:

    ```env
    DATABASE_URL="postgresql://your_username:your_password@localhost:5432/aura_auth_db?schema=public"
    JWT_SECRET="your_very_long_and_complex_jwt_secret_key"
    PORT=3001
    ```

4.  **Generar Cliente Prisma (para ejecución local):**

    ```bash
    npx prisma generate
    ```

5.  **Iniciar el servidor (para ejecución local):**

    *   **Modo desarrollo (con `nodemon`):**
        ```bash
        npm run dev
        ```
    *   **Modo producción:**
        ```bash
        npm start
        ```

    El servicio estará disponible en `http://localhost:3001`.

6.  **Despliegue con Docker (Recomendado):**
    Desde el directorio raíz `aura_server`, ejecuta el script de despliegue:
    ```bash
    ./setup.sh
    ```
    Esto levantará todos los servicios, incluyendo la base de datos, el servicio de autenticación y el API Gateway.
## 🌐 Endpoints

Todos los endpoints están prefijados con `/api/auth`.

| Método | Endpoint         | Descripción                                                                                | Autenticación  | Autorización |
| :----- | :--------------- | :----------------------------------------------------------------------------------------- | :------------- | :----------- |
| `POST` | `/api/auth/register`| Registra un nuevo usuario en el sistema.                                                   | No             | Cualquiera   |
| `POST` | `/api/auth/login` | Autentica a un usuario y devuelve un token JWT.                                            | No             | Cualquiera   |
| `GET`  | `/api/auth/profile`| Obtiene el perfil del usuario autenticado.                                                 | JWT            | Usuario      |
| `GET`  | `/api/auth/users` | Obtiene la lista de todos los usuarios (solo para administradores).                        | JWT            | Admin        |

---

## 🔒 Validaciones y Seguridad Implementadas

Este microservicio implementa un conjunto robusto de validaciones y medidas de seguridad siguiendo las mejores prácticas.

### 1. Transacciones Seguras con Prisma
> Prisma garantiza la **atomicidad** en las operaciones de escritura que involucran relaciones. En el endpoint de registro, la creación del `user` y la conexión (`connect`) con su `role` se ejecutan dentro de una única transacción. Esto asegura que si la conexión con el rol falla, la creación del usuario también se revierte, manteniendo la consistencia e integridad de los datos.
> *   **Librería:** `@prisma/client`
> *   **Implementación:** `src/controllers/authController.js`

```javascript
const newUser = await prisma.user.create({
    data: {
        username,
        email,
        password_hash,
        role: {
            // Esta operación anidada se ejecuta en la misma transacción
            connect: { role_name: 'user' } 
        }
    },
    // ...
});
```

### 2. Validación Rigurosa en el Servidor
> Se implementan múltiples capas de validación para proteger los endpoints y la base de datos.
*   **Autenticidad y Permisos**: Se verifica la validez de cada token JWT y se restringe el acceso a endpoints específicos (ej. solo `admin`) usando middlewares (`verifyToken`, `authorizeRole`).
*   **Consistencia de Datos**: Antes de crear un usuario, se comprueba que el `email` y `username` no estén ya en uso para evitar duplicados.
*   **Integridad del Token**: La firma del JWT se valida para asegurar que no ha sido manipulado.
> *   **Implementación:** `src/controllers/authController.js`

```javascript
// Validación de Consistencia: Verificar si el usuario o email ya existen
const existingUser = await prisma.user.findUnique({ where: { email } });
if (existingUser) {
    return res.status(409).json({ message: 'User with this email already exists.' });
}
const existingUsername = await prisma.user.findUnique({ where: { username } });
if (existingUsername) {
    return res.status(409).json({ message: 'Username is already taken.' });
}
```

### 3. Validación de Formato y Patrones
> Se utiliza `express-validator` para asegurar que todos los datos de entrada cumplan con las reglas de negocio antes de ser procesados.
*   **Tipos de Datos**: Se valida que campos como `email` y `password` tengan el formato y tipo correctos (`isEmail`, `isLength`).
*   **Contraseñas Fuertes**: Se exige una combinación de mayúsculas, minúsculas, números y símbolos.
*   **Nombres de Usuario**: Se valida un patrón (`/^[a-zA-Z0-9_]+$/`) para que solo contenga caracteres permitidos.
> *   **Implementación:** `src/middlewares/validationMiddleware.js` (Ejemplo de uso en rutas)

```javascript
// En `src/routes/authRoutes.js`, se aplican las validaciones antes del controlador:
const { registerValidation, loginValidation } = require('../middlewares/validationMiddleware');

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
```

### 4. Sanitización de Entradas
> Para prevenir ataques como XSS (Cross-Site Scripting), todas las entradas son sanitizadas.
*   **Escapado de Caracteres**: Se usa `escape()` para convertir caracteres HTML (`<`, `>`, `&`, etc.) en entidades, neutralizando scripts maliciosos.
*   **Normalización**: Se normalizan los correos electrónicos (`normalizeEmail()`) para estandarizar su formato y evitar evasiones.
> *   **Implementación:** `src/middlewares/validationMiddleware.js`

```javascript
// Ejemplo de regla de validación y sanitización en `validationMiddleware.js`
const { body } = require('express-validator');

const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('username').trim().escape(),
    // ... más validaciones
];
```

### 5. Uso de Librerías Seguras
> La seguridad se delega en librerías auditadas y mantenidas por la comunidad.
*   **ORM (Prisma)**: Previene ataques de inyección SQL al parametrizar todas las consultas a la base de datos de forma automática.
*   **Validación (Express-validator)**: Proporciona un conjunto de herramientas robustas para validar y sanitizar datos de manera segura.
> *   **Implementación:** `src/controllers/authController.js`

```javascript
// Prisma parametriza automáticamente el valor de 'email' para prevenir inyección SQL.
const user = await prisma.user.findUnique({
    where: { email }, // El valor de 'email' es manejado de forma segura
    include: { role: true }
});
```

### 6. Gestión Segura de Errores
> Los errores se manejan de forma controlada para no exponer información sensible.
*   **Mensajes Genéricos**: De cara al cliente, los errores (ej. "Invalid credentials") son intencionadamente ambiguos para no revelar si un usuario existe o no.
*   **No Exposición de Stack Traces**: Los errores internos se registran en el servidor, pero nunca se envían los detalles completos al cliente.
> *   **Implementación:** `src/controllers/authController.js` y `index.js`

```javascript
// Mensaje genérico en el login para no revelar información
const isMatch = await bcrypt.compare(password, user.password_hash);
if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials.' });
}

// Middleware global en index.js para capturar errores no controlados
app.use((err, req, res, next) => {
    console.error(err.stack); // Loguea el error completo en el servidor
    res.status(500).json({ message: 'Something broke!' }); // Envía respuesta genérica
});
```