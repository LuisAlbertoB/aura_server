# 📋 API Documentation - Microservicio Social
## Especificación Completa v2.0

**Fecha:** 15 de noviembre de 2025  
**Versión:** 2.0  
**Base URL:** `http://localhost:3001/api/v1`  

---

## 🔐 Autenticación

Todas las rutas protegidas requieren JWT en el header:

```http
Authorization: Bearer <jwt-token>
```

**Estructura del JWT:**
```json
{
  "id": "usuario-uuid-aqui",
  "email": "usuario@ejemplo.com",
  "role": "user",
  "iat": 1699440000,
  "exp": 1700044800
}
```

---

## 👤 Complete Profile API

### ✅ POST /api/v1/complete-profile
**Descripción:** Crear perfil completo del usuario autenticado

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```typescript
{
  full_name: string,        // 2-100 caracteres (requerido)
  age: number,             // 13-120 (requerido)
  bio?: string,            // Max 500 caracteres (opcional)
  hobbies?: string,        // Max 255 caracteres, separados por comas (opcional)
  profile_picture?: File   // Imagen JPG/PNG/WEBP, max 5MB (opcional)
}
```

**Ejemplo con JavaScript/Fetch:**
```javascript
const formData = new FormData();
formData.append('full_name', 'Juan Pérez González');
formData.append('age', '28');
formData.append('bio', 'Desarrollador apasionado por la tecnología');
formData.append('hobbies', 'Programación, Fotografía, Viajes');

// Si hay imagen
if (imageFile) {
  formData.append('profile_picture', imageFile);
}

const response = await fetch('http://localhost:3001/api/v1/complete-profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Perfil completo creado exitosamente",
  "data": {
    "profile": {
      "id": 1,
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "full_name": "Juan Pérez González",
      "age": 28,
      "bio": "Desarrollador apasionado por la tecnología",
      "profile_picture_url": "https://res.cloudinary.com/.../profile.jpg",
      "hobbies": "Programación, Fotografía, Viajes",
      "created_at": "2025-11-15T10:30:00.000Z",
      "updated_at": "2025-11-15T10:30:00.000Z"
    }
  }
}
```

**Errores:**
```json
// 400 - Validación
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "field": "full_name",
      "message": "El nombre completo debe tener entre 2 y 100 caracteres"
    }
  ]
}

// 409 - Conflicto
{
  "success": false,
  "message": "Ya existe un perfil completo para este usuario"
}
```

---

### 🔍 GET /api/v1/complete-profile
**Descripción:** Obtener perfil completo del usuario autenticado

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": 1,
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "full_name": "Juan Pérez González",
      "age": 28,
      "bio": "Desarrollador apasionado por la tecnología",
      "profile_picture_url": "https://res.cloudinary.com/.../profile.jpg",
      "hobbies": "Programación, Fotografía, Viajes",
      "created_at": "2025-11-15T10:30:00.000Z",
      "updated_at": "2025-11-15T10:30:00.000Z"
    }
  }
}
```

**Errores:**
```json
// 404 - No encontrado
{
  "success": false,
  "message": "Perfil completo no encontrado"
}
```

---

### 🔄 PUT /api/v1/complete-profile
**Descripción:** Actualizar perfil completo (todos los campos opcionales)

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (todos opcionales):**
```typescript
{
  full_name?: string,
  age?: number,
  bio?: string,
  hobbies?: string,
  profile_picture?: File
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Perfil completo actualizado exitosamente",
  "data": {
    "profile": {
      "id": 1,
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "full_name": "Juan Pérez González",
      "age": 29,
      "bio": "Nueva biografía actualizada",
      "profile_picture_url": "https://res.cloudinary.com/.../new-profile.jpg",
      "hobbies": "Programación, Música",
      "created_at": "2025-11-15T10:30:00.000Z",
      "updated_at": "2025-11-15T11:45:00.000Z"
    }
  }
}
```

---

### 🗑️ DELETE /api/v1/complete-profile
**Descripción:** Eliminar perfil completo

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Perfil completo eliminado exitosamente"
}
```

---

### 🔍 GET /api/v1/complete-profile/:userId
**Descripción:** Obtener perfil completo de otro usuario (público)

**Path Parameters:**
- `userId`: UUID del usuario

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": 2,
      "user_id": "550e8400-e29b-41d4-a716-446655440002",
      "full_name": "María García",
      "age": 25,
      "bio": "Diseñadora UI/UX",
      "profile_picture_url": "https://res.cloudinary.com/.../maria.jpg",
      "hobbies": "Diseño, Arte, Fotografía",
      "created_at": "2025-11-15T09:00:00.000Z",
      "updated_at": "2025-11-15T09:00:00.000Z"
    }
  }
}
```

---

## 👥 User Profiles API (Perfil Social)

### ✏️ POST /api/v1/profiles
**Descripción:** Crear perfil social del usuario autenticado

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```typescript
{
  displayName: string,     // 1-100 caracteres (requerido)
  bio?: string,           // Max 500 caracteres
  avatar?: File,          // Imagen (obligatorio)
  birthDate?: string,     // YYYY-MM-DD
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Perfil creado exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "display_name": "Juan Pérez",
    "bio": "Desarrollador Full Stack",
    "avatar_url": "https://res.cloudinary.com/.../avatar.jpg",
    "birth_date": "1990-05-15",
    "gender": "male",
    "followers_count": 0,
    "following_count": 0,
    "posts_count": 0,
    "is_verified": false,
    "is_active": true,
    "created_at": "2025-11-15T11:00:00Z",
    "updated_at": "2025-11-15T11:00:00Z"
  }
}
```

---

### 🔍 GET /api/v1/profiles/:userId
**Descripción:** Obtener perfil por ID de usuario

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "profile": {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "displayName": "Juan Pérez",
      "bio": "Desarrollador Full Stack",
      "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg",
      "followersCount": 150,
      "followingCount": 89,
      "postsCount": 24,
      "isVerified": false,
      "isActive": true,
      "createdAt": "2025-11-15T11:00:00Z"
    }
  }
}
```

---

### 👥 POST /api/v1/profiles/friends
**Descripción:** Agregar amigo

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "friendId": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Amigo agregado exitosamente",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "friendId": "550e8400-e29b-41d4-a716-446655440002",
    "status": "pending"
  }
}
```

---

### 🚫 POST /api/v1/profiles/blocked-users
**Descripción:** Bloquear usuario

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userIdToBlock": "550e8400-e29b-41d4-a716-446655440003"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Usuario bloqueado exitosamente",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "blockedUserId": "550e8400-e29b-41d4-a716-446655440003",
    "blockedAt": "2025-11-15T11:20:00Z"
  }
}
```

---

## 📝 Publications API

### 🔍 GET /api/v1/publications
**Descripción:** Obtener publicaciones (auth opcional)

**Query Parameters:**
```typescript
{
  page?: number,          // Default: 1
  limit?: number,         // 1-50, default: 10
  userId?: string,        // Filtrar por autor
  visibility?: 'public' | 'private' | 'friends',
  type?: 'text' | 'image' | 'video' | 'text_image'
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Publicaciones obtenidas exitosamente",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "content": "Mi primera publicación",
      "type": "text",
      "visibility": "public",
      "likes_count": 5,
      "comments_count": 2,
      "created_at": "2025-11-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 48,
    "limit": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### ✏️ POST /api/v1/publications
**Descripción:** Crear publicación

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```typescript
{
  content?: string,       // 1-5000 caracteres
  type?: 'text' | 'image' | 'video' | 'text_image',
  visibility?: 'public' | 'private' | 'friends',
  location?: string,      // Max 255 caracteres
  tags?: string[],        // Max 10 elementos
  files?: File[]          // Archivos multimedia
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Publicación creada exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "content": "Nueva publicación",
    "type": "text",
    "visibility": "public",
    "likes_count": 0,
    "comments_count": 0,
    "created_at": "2025-11-15T10:35:00Z"
  }
}
```

---

### 👍 POST /api/v1/publications/:id/like
**Descripción:** Dar like a publicación

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "like"  // like, love, angry, sad, wow
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Like agregado exitosamente",
  "data": {
    "publicationId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "type": "like",
    "likesCount": 16
  }
}
```

---

### 👎 DELETE /api/v1/publications/:id/like
**Descripción:** Quitar like

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Like eliminado exitosamente",
  "data": {
    "publicationId": "550e8400-e29b-41d4-a716-446655440000",
    "likesCount": 15
  }
}
```

---

## 💬 Comments API

### 🔍 GET /api/v1/publications/:id/comments
**Descripción:** Obtener comentarios de una publicación

**Query Parameters:**
```typescript
{
  page?: number,
  limit?: number,
  hierarchical?: boolean   // Estructura jerárquica
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Comentarios obtenidos exitosamente",
  "data": {
    "publicationId": "550e8400-e29b-41d4-a716-446655440000",
    "totalComments": 8,
    "comments": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "post_id": "550e8400-e29b-41d4-a716-446655440000",
        "user_id": "550e8400-e29b-41d4-a716-446655440002",
        "content": "Excelente publicación!",
        "likes_count": 2,
        "replies_count": 1,
        "level": 1,
        "created_at": "2025-11-15T10:45:00Z"
      }
    ]
  }
}
```

---

### ✏️ POST /api/v1/publications/:id/comments
**Descripción:** Agregar comentario

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Mi comentario",    // 1-2000 caracteres (requerido)
  "parentId": "uuid-opcional"    // Para respuestas
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Comentario agregado exitosamente",
  "data": {
    "comment": {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "post_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440003",
      "content": "Mi comentario",
      "level": 1,
      "created_at": "2025-11-15T10:50:00Z"
    }
  }
}
```

---

## 🤝 Friendships API

### POST /api/v1/friendships/request
**Descripción:** Enviar solicitud de amistad

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "friendId": "550e8400-e29b-41d4-a716-446655440002"
}
```

---

## 🏥 Health & System

### ❤️ GET /health
**Descripción:** Estado del servicio

**Response:**
```json
{
  "success": true,
  "message": "Social Service está funcionando correctamente",
  "timestamp": "2025-11-15T11:25:00Z",
  "environment": "development"
}
```

---

## 🔌 Integración con otros Microservicios

### 📬 Microservicio de Notificaciones

**Configuración necesaria:**

1. **Variables de entorno en Social Service:**
```env
NOTIFICATIONS_SERVICE_URL=http://localhost:3002
NOTIFICATIONS_API_KEY=tu-api-key-secreta
```

2. **Eventos que disparan notificaciones:**

```javascript
// Después de crear una publicación
await notificationService.send({
  type: 'NEW_PUBLICATION',
  userId: userId,
  data: {
    publicationId: publication.id,
    content: publication.content
  }
});

// Después de recibir un like
await notificationService.send({
  type: 'NEW_LIKE',
  userId: publication.user_id,
  data: {
    likedBy: req.user.id,
    publicationId: publication.id
  }
});

// Después de recibir un comentario
await notificationService.send({
  type: 'NEW_COMMENT',
  userId: publication.user_id,
  data: {
    commentBy: req.user.id,
    publicationId: publication.id,
    comment: comment.content
  }
});
```

3. **Endpoints del servicio de notificaciones:**
```http
POST http://localhost:3002/api/v1/notifications
GET http://localhost:3002/api/v1/notifications/user/:userId
PUT http://localhost:3002/api/v1/notifications/:id/read
```

---

### 💬 Microservicio de Mensajería

**Configuración necesaria:**

1. **Variables de entorno en Social Service:**
```env
MESSAGING_SERVICE_URL=http://localhost:3003
MESSAGING_WS_URL=ws://localhost:3003
```

2. **WebSocket para mensajes en tiempo real:**

```javascript
// Cliente WebSocket
const ws = new WebSocket('ws://localhost:3003');

ws.on('connect', () => {
  ws.send(JSON.stringify({
    type: 'AUTH',
    token: userToken
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  // Manejar nuevo mensaje
});
```

3. **Endpoints del servicio de mensajería:**
```http
# Enviar mensaje
POST http://localhost:3003/api/v1/messages
Content-Type: application/json
Authorization: Bearer <token>

{
  "recipientId": "uuid",
  "content": "Hola!",
  "type": "text"
}

# Obtener conversaciones
GET http://localhost:3003/api/v1/conversations

# Obtener mensajes de una conversación
GET http://localhost:3003/api/v1/conversations/:conversationId/messages
```

---

## 🚨 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Errores de validación |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | Recurso no encontrado |
| 409 | Conflicto (duplicado) |
| 429 | Demasiadas solicitudes |
| 500 | Error interno del servidor |

---

## 💡 Guía de Integración Frontend Flutter

### 1. Configuración del Cliente

```dart
class SocialApiClient {
  final String baseUrl = 'http://localhost:3001/api/v1';
  final Dio _dio = Dio();
  String? _token;

  void setToken(String token) {
    _token = token;
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  Future<Response> get(String endpoint) async {
    return await _dio.get('$baseUrl$endpoint');
  }

  Future<Response> post(String endpoint, dynamic data) async {
    return await _dio.post('$baseUrl$endpoint', data: data);
  }
}
```

### 2. Crear Perfil Completo

```dart
Future<void> createCompleteProfile({
  required String fullName,
  required int age,
  String? bio,
  String? hobbies,
  File? profilePicture,
}) async {
  final formData = FormData.fromMap({
    'full_name': fullName,
    'age': age,
    if (bio != null) 'bio': bio,
    if (hobbies != null) 'hobbies': hobbies,
    if (profilePicture != null)
      'profile_picture': await MultipartFile.fromFile(
        profilePicture.path,
        filename: 'profile.jpg',
      ),
  });

  final response = await _dio.post(
    '$baseUrl/complete-profile',
    data: formData,
  );

  if (response.statusCode == 201) {
    print('Perfil creado: ${response.data}');
  }
}
```

---

 