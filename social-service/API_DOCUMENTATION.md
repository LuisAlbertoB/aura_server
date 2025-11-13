# Social Service API Documentation

## 🚀 Información General

- **Puerto**: 3001
- **Base URL**: `http://localhost:3001/api/v1`
- **Autenticación**: JWT Bearer Token
- **Formato de respuesta**: JSON

## 📋 Tabla de Contenidos

1. [Publicaciones](#publicaciones)
2. [Perfiles de Usuario](#perfiles-de-usuario)
3. [Comunidades](#comunidades)
4. [Preferencias de Usuario](#preferencias-de-usuario)
5. [Perfiles Completos](#perfiles-completos)
6. [Sistema de Amistades](#sistema-de-amistades)
7. [Códigos de Estado](#códigos-de-estado)
8. [Autenticación](#autenticación)

---

## 🔐 Autenticación

Todas las rutas que requieren autenticación deben incluir el header:
```
Authorization: Bearer <token_jwt>
```

---

## 📰 Publicaciones

### GET /api/v1/publications
Obtener todas las publicaciones (con filtrado de visibilidad)

**Headers**: `Authorization` (opcional - para filtrar amigos)

**Query Parameters**:
```typescript
{
  page?: number,        // Número de página (default: 1)
  limit?: number,       // Elementos por página (default: 10, max: 50)
  type?: string,        // Filtrar por tipo: "text" | "image" | "video" | "text_image"
  visibility?: string,  // Filtrar por visibilidad: "public" | "private" | "friends"
  userId?: string      // Filtrar por usuario específico
}
```

**Response**:
```typescript
{
  success: boolean,
  data: {
    publications: Array<{
      id: string,
      user_id: string,
      content: string,
      type: "text" | "image" | "video" | "text_image",
      visibility: "public" | "private" | "friends",
      location?: string,
      tags?: string[],
      like_count: number,
      comment_count: number,
      media_urls?: string[],
      created_at: string,
      updated_at: string,
      user_info?: {
        username: string,
        profile_picture?: string
      }
    }>,
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
}
```

### POST /api/v1/publications
Crear nueva publicación

**Headers**: `Authorization: Bearer <token>` (requerido)

**Body** (multipart/form-data):
```typescript
{
  content?: string,                    // Contenido de texto (1-5000 caracteres)
  type?: "text" | "image" | "video" | "text_image",  // Default: "text"
  visibility?: "public" | "private" | "friends",     // Default: "public"
  location?: string,                   // Ubicación opcional (max 255 caracteres)
  tags?: string,                      // JSON array de tags (max 10)
  images?: File[]                     // Archivos de imagen (múltiples)
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  data: {
    publication: {
      id: string,
      user_id: string,
      content: string,
      type: string,
      visibility: string,
      location?: string,
      tags?: string[],
      media_urls?: string[],
      created_at: string
    }
  }
}
```

### GET /api/v1/publications/:id
Obtener publicación por ID

**Response**: Igual que POST pero sin el array, solo el objeto publication.

### POST /api/v1/publications/:id/like
Dar like a una publicación

**Headers**: `Authorization: Bearer <token>` (requerido)

**Response**:
```typescript
{
  success: boolean,
  message: string,
  data: {
    like_count: number
  }
}
```

### DELETE /api/v1/publications/:id/like
Quitar like de una publicación

**Headers**: `Authorization: Bearer <token>` (requerido)

**Response**: Igual que POST like.

### GET /api/v1/publications/:id/comments
Obtener comentarios de una publicación

**Query Parameters**:
```typescript
{
  page?: number,    // Default: 1
  limit?: number    // Default: 20, max: 50
}
```

**Response**:
```typescript
{
  success: boolean,
  data: {
    comments: Array<{
      id: string,
      user_id: string,
      publication_id: string,
      content: string,
      parent_id?: string,
      created_at: string,
      user_info?: {
        username: string,
        profile_picture?: string
      }
    }>,
    pagination: object
  }
}
```

### POST /api/v1/publications/:id/comments
Agregar comentario a una publicación

**Headers**: `Authorization: Bearer <token>` (requerido)

**Body**:
```typescript
{
  content: string,     // 1-2000 caracteres
  parent_id?: string   // ID del comentario padre (para respuestas)
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  data: {
    comment: {
      id: string,
      content: string,
      created_at: string
    }
  }
}
```

---

## 👥 Comunidades

### GET /api/v1/communities
Obtener todas las comunidades públicas

**Query Parameters**:
```typescript
{
  page?: number,      // Default: 1
  limit?: number,     // Default: 10, max: 50
  category?: string   // Filtrar por categoría
}
```

**Response**:
```typescript
{
  success: boolean,
  data: {
    communities: Array<{
      id: number,
      name: string,
      description: string,
      category: string,
      tags?: string,
      privacy: "public" | "private",
      image_url?: string,
      creator_id: number,
      member_count: number,
      created_at: string,
      updated_at: string
    }>,
    pagination: object
  }
}
```

### POST /api/v1/communities
Crear nueva comunidad

**Headers**: `Authorization: Bearer <token>` (requerido)

**Body** (multipart/form-data):
```typescript
{
  name: string,           // 3-100 caracteres (requerido)
  description: string,    // 10-500 caracteres (requerido)
  category: string,       // 1-50 caracteres (requerido)
  tags?: string,         // Max 500 caracteres
  privacy?: "public" | "private",  // Default: "public"
  image?: File           // Imagen de la comunidad
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  data: {
    community: {
      id: number,
      name: string,
      description: string,
      category: string,
      tags?: string,
      privacy: string,
      image_url?: string,
      creator_id: number,
      created_at: string
    }
  }
}
```

### GET /api/v1/communities/:id
Obtener comunidad por ID

**Response**: Igual que POST pero con información adicional de miembros.

### PUT /api/v1/communities/:id
Actualizar comunidad (solo el creador)

**Headers**: `Authorization: Bearer <token>` (requerido)

**Body** (multipart/form-data): Mismos campos que POST pero todos opcionales.

### DELETE /api/v1/communities/:id
Eliminar comunidad (solo el creador)

**Headers**: `Authorization: Bearer <token>` (requerido)

### POST /api/v1/communities/:id/join
Unirse a una comunidad

**Headers**: `Authorization: Bearer <token>` (requerido)

**Response**:
```typescript
{
  success: boolean,
  message: string
}
```

### POST /api/v1/communities/:id/leave
Salir de una comunidad

**Headers**: `Authorization: Bearer <token>` (requerido)

### GET /api/v1/communities/:id/members
Obtener miembros de una comunidad

**Query Parameters**:
```typescript
{
  page?: number,    // Default: 1
  limit?: number    // Default: 20, max: 50
}
```

**Response**:
```typescript
{
  success: boolean,
  data: {
    members: Array<{
      user_id: number,
      joined_at: string,
      role: string,
      user_info?: {
        username: string,
        profile_picture?: string
      }
    }>,
    pagination: object
  }
}
```

---

## ⚙️ Preferencias de Usuario

### GET /api/v1/preferences
Obtener preferencias del usuario autenticado

**Headers**: `Authorization: Bearer <token>` (requerido)

**Response**:
```typescript
{
  success: boolean,
  data: {
    preferences: {
      user_id: number,
      Deportes?: number,        // 1-10
      Arte?: number,           // 1-10
      Música?: number,         // 1-10
      Tecnología?: number,     // 1-10
      Ciencia?: number,        // 1-10
      Viajes?: number,         // 1-10
      Cocina?: number,         // 1-10
      Lectura?: number,        // 1-10
      Entretenimiento?: number, // 1-10
      Naturaleza?: number,     // 1-10
      Historia?: number,       // 1-10
      Moda?: number,          // 1-10
      created_at: string,
      updated_at: string
    }
  }
}
```

### POST /api/v1/preferences
Crear o actualizar preferencias del usuario

**Headers**: `Authorization: Bearer <token>` (requerido)

**Body**:
```typescript
{
  Deportes?: number,        // 1-10
  Arte?: number,           // 1-10
  Música?: number,         // 1-10
  Tecnología?: number,     // 1-10
  Ciencia?: number,        // 1-10
  Viajes?: number,         // 1-10
  Cocina?: number,         // 1-10
  Lectura?: number,        // 1-10
  Entretenimiento?: number, // 1-10
  Naturaleza?: number,     // 1-10
  Historia?: number,       // 1-10
  Moda?: number           // 1-10
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  data: {
    preferences: object  // Misma estructura que GET
  }
}
```

### PUT /api/v1/preferences
Actualizar preferencias (alias de POST)

### DELETE /api/v1/preferences
Eliminar preferencias del usuario

**Headers**: `Authorization: Bearer <token>` (requerido)

### GET /api/v1/preferences/categories
Obtener lista de categorías disponibles

**Response**:
```typescript
{
  success: boolean,
  data: {
    categories: [
      "Deportes", "Arte", "Música", "Tecnología", 
      "Ciencia", "Viajes", "Cocina", "Lectura", 
      "Entretenimiento", "Naturaleza", "Historia", "Moda"
    ]
  }
}
```

---

## 👤 Perfiles Completos

### GET /api/v1/complete-profile
Obtener perfil completo del usuario autenticado

**Headers**: `Authorization: Bearer <token>` (requerido)

**Response**:
```typescript
{
  success: boolean,
  data: {
    profile: {
      id: number,
      user_id: number,
      full_name: string,
      age: number,
      bio?: string,
      profile_picture_url?: string,
      hobbies?: string,
      created_at: string,
      updated_at: string
    }
  }
}
```

### POST /api/v1/complete-profile
Crear perfil completo

**Headers**: `Authorization: Bearer <token>` (requerido)

**Body** (multipart/form-data):
```typescript
{
  full_name: string,        // 2-100 caracteres (requerido)
  age: number,             // 13-120 (requerido)
  bio?: string,            // Max 500 caracteres
  hobbies?: string,        // Max 255 caracteres (separados por comas)
  profile_picture?: File   // Imagen de perfil
}
```

### PUT /api/v1/complete-profile
Actualizar perfil completo

**Body**: Mismos campos que POST pero todos opcionales.

### DELETE /api/v1/complete-profile
Eliminar perfil completo

**Headers**: `Authorization: Bearer <token>` (requerido)

### GET /api/v1/complete-profile/:userId
Obtener perfil completo de otro usuario (público)

**Response**: Misma estructura que GET propio.

---

## 👫 Sistema de Amistades

### POST /api/v1/friendships/send
Enviar solicitud de amistad

**Headers**: `Authorization: Bearer <token>` (requerido)

**Body**:
```typescript
{
  friend_id: number  // ID del usuario al que enviar la solicitud
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  data: {
    friendship: {
      id: number,
      user_id: number,
      friend_id: number,
      status: "pending",
      created_at: string
    }
  }
}
```

### PUT /api/v1/friendships/accept/:friendshipId
Aceptar solicitud de amistad

**Headers**: `Authorization: Bearer <token>` (requerido)

**Response**:
```typescript
{
  success: boolean,
  message: string,
  data: {
    friendship: {
      id: number,
      status: "accepted",
      updated_at: string
    }
  }
}
```

### PUT /api/v1/friendships/reject/:friendshipId
Rechazar solicitud de amistad

**Headers**: `Authorization: Bearer <token>` (requerido)

### GET /api/v1/friendships
Obtener lista de amigos

**Headers**: `Authorization: Bearer <token>` (requerido)

**Query Parameters**:
```typescript
{
  page?: number,    // Default: 1
  limit?: number    // Default: 20, max: 50
}
```

**Response**:
```typescript
{
  success: boolean,
  data: {
    friends: Array<{
      id: number,
      user_id: number,
      friend_id: number,
      status: "accepted",
      created_at: string,
      friend_info: {
        id: number,
        username: string,
        profile_picture?: string,
        full_name?: string
      }
    }>,
    pagination: object
  }
}
```

### GET /api/v1/friendships/pending
Obtener solicitudes pendientes

**Headers**: `Authorization: Bearer <token>` (requerido)

**Query Parameters**:
```typescript
{
  type?: "received" | "sent",  // Filtrar por tipo
  page?: number,
  limit?: number
}
```

**Response**:
```typescript
{
  success: boolean,
  data: {
    requests: Array<{
      id: number,
      user_id: number,
      friend_id: number,
      status: "pending",
      created_at: string,
      requester_info?: object,  // Si type="received"
      recipient_info?: object   // Si type="sent"
    }>,
    pagination: object
  }
}
```

### DELETE /api/v1/friendships/:friendId
Eliminar amistad

**Headers**: `Authorization: Bearer <token>` (requerido)

### POST /api/v1/friendships/block
Bloquear usuario

**Headers**: `Authorization: Bearer <token>` (requerido)

**Body**:
```typescript
{
  blocked_id: number  // ID del usuario a bloquear
}
```

### DELETE /api/v1/friendships/unblock/:blockedId
Desbloquear usuario

**Headers**: `Authorization: Bearer <token>` (requerido)

### GET /api/v1/friendships/blocked
Obtener lista de usuarios bloqueados

**Headers**: `Authorization: Bearer <token>` (requerido)

### GET /api/v1/friendships/status/:userId
Obtener estado de relación con un usuario

**Headers**: `Authorization: Bearer <token>` (requerido)

**Response**:
```typescript
{
  success: boolean,
  data: {
    status: "friends" | "pending_sent" | "pending_received" | "blocked" | "none",
    friendship_id?: number
  }
}
```

---

## 📁 Perfiles de Usuario (Original)

### POST /api/v1/profiles
Crear perfil básico

**Headers**: `Authorization: Bearer <token>` (requerido)

### PUT /api/v1/profiles
Actualizar perfil básico

### POST /api/v1/profiles/friends
Agregar amigo (sistema anterior)

### POST /api/v1/profiles/blocked-users
Bloquear usuario (sistema anterior)

---

## 📋 Códigos de Estado

- **200**: OK - Operación exitosa
- **201**: Created - Recurso creado exitosamente
- **400**: Bad Request - Datos de entrada inválidos
- **401**: Unauthorized - Token inválido o expirado
- **403**: Forbidden - No tienes permisos para esta acción
- **404**: Not Found - Recurso no encontrado
- **409**: Conflict - Recurso ya existe o conflicto de estado
- **422**: Unprocessable Entity - Errores de validación
- **429**: Too Many Requests - Límite de rate limiting alcanzado
- **500**: Internal Server Error - Error del servidor

---

## 🔄 Formato de Respuesta de Error

```typescript
{
  success: false,
  message: string,
  errors?: Array<{
    field: string,
    message: string,
    value?: any
  }>
}
```

---

## 🛠️ Ejemplos de Uso con cURL

### Crear una publicación con imagen:
```bash
curl -X POST http://localhost:3001/api/v1/publications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=Mi nueva publicación con imagen" \
  -F "type=text_image" \
  -F "visibility=public" \
  -F "images=@imagen.jpg"
```

### Crear una comunidad:
```bash
curl -X POST http://localhost:3001/api/v1/communities \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Desarrolladores Node.js" \
  -F "description=Comunidad para desarrolladores que usan Node.js" \
  -F "category=Tecnología" \
  -F "privacy=public" \
  -F "image=@community-logo.png"
```

### Actualizar preferencias:
```bash
curl -X POST http://localhost:3001/api/v1/preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Tecnología": 9,
    "Música": 7,
    "Deportes": 5,
    "Arte": 8
  }'
```

### Enviar solicitud de amistad:
```bash
curl -X POST http://localhost:3001/api/v1/friendships/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"friend_id": 123}'
```

---

## 📝 Notas Importantes

1. **Autenticación**: La mayoría de endpoints requieren token JWT válido
2. **Paginación**: Todos los endpoints que retornan listas soportan paginación
3. **Rate Limiting**: Hay límites de requests por minuto implementados
4. **File Uploads**: Los archivos se suben usando multipart/form-data
5. **Visibilidad de publicaciones**: Se respeta según relaciones de amistad
6. **Validación**: Todos los inputs son validados según las especificaciones
7. **CORS**: Configurado para desarrollo local y testing

Para más información técnica, consulta el código fuente en `/src/presentation/controllers/`