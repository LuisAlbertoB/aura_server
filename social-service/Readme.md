# 📋 API Contract - Microservicio Social
## Especificación Completa para Integración Frontend

**Fecha:** 8 de noviembre de 2025  
**Versión:** 1.0  
**Base URL:** `http://localhost:3001/api/v1`  

---

## 🔗 Estructura de Datos Base

### 📝 Publication (Publicación)
```typescript
interface Publication {
  id: string;                    // UUID v4
  user_id: string;               // UUID v4 del autor
  content?: string;              // Texto de la publicación (máx 5000 chars)
  type: 'text' | 'image' | 'video' | 'text_image' | 'text_video';
  visibility: 'public' | 'private' | 'friends';
  location?: string;             // Ubicación (máx 255 chars)
  tags?: string[];               // Array de tags (máx 10)
  metadata?: object;             // Metadatos adicionales
  likes_count: number;           // Contador de likes
  comments_count: number;        // Contador de comentarios
  shares_count: number;          // Contador de shares
  is_active: boolean;            // Estado activo
  created_at: string;            // ISO 8601 timestamp
  updated_at: string;            // ISO 8601 timestamp
}
```

### 💬 Comment (Comentario)
```typescript
interface Comment {
  id: string;                    // UUID v4
  post_id: string;               // UUID v4 de la publicación
  user_id: string;               // UUID v4 del autor
  parent_id?: string;            // UUID v4 del comentario padre (null para comentarios raíz)
  content: string;               // Contenido (1-2000 chars)
  likes_count: number;           // Contador de likes
  replies_count: number;         // Contador de respuestas
  level: number;                 // Nivel de anidación (1=raíz, 2=respuesta, etc.)
  is_edited: boolean;            // Si fue editado
  is_active: boolean;            // Estado activo
  edited_at?: string;            // Fecha de edición (ISO 8601)
  created_at: string;            // ISO 8601 timestamp
  updated_at: string;            // ISO 8601 timestamp
}
```

### 👤 UserProfile (Perfil de Usuario)
```typescript
interface UserProfile {
  id: string;                    // UUID v4
  user_id: string;               // UUID v4 único (referencia externa)
  display_name: string;          // Nombre a mostrar (1-100 chars)
  bio?: string;                  // Biografía (máx 500 chars)
  avatar_url?: string;           // URL del avatar
  cover_url?: string;            // URL de portada
  location?: string;             // Ubicación (máx 100 chars)
  website?: string;              // Sitio web (máx 255 chars)
  birth_date?: string;           // YYYY-MM-DD
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  privacy_settings?: object;      // Configuraciones de privacidad
  preferences?: object;          // Preferencias del usuario
  followers_count: number;       // Número de seguidores
  following_count: number;       // Número seguidos
  posts_count: number;           // Número de posts
  is_verified: boolean;          // Verificado
  is_active: boolean;            // Activo
  last_active_at?: string;       // Última actividad (ISO 8601)
  created_at: string;            // ISO 8601 timestamp
  updated_at: string;            // ISO 8601 timestamp
}
```

### 👍 Like (Me Gusta)
```typescript
interface Like {
  id: string;                    // UUID v4
  user_id: string;               // UUID v4 del usuario
  entity_type: 'post' | 'comment'; // Tipo de entidad
  entity_id: string;             // UUID v4 de la entidad
  type: 'like' | 'dislike' | 'love' | 'angry' | 'sad' | 'wow';
  created_at: string;            // ISO 8601 timestamp
}
```

### 🔄 API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
  pagination?: PaginationMeta;
}

interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

---

## 📝 Publications API

### 🔍 GET /publications
**Descripción:** Obtener lista paginada de publicaciones

**Query Parameters:**
```typescript
{
  page?: number;           // Página (default: 1)
  limit?: number;          // Límite por página (1-50, default: 10)
  userId?: string;         // Filtrar por autor (UUID v4)
  visibility?: 'public' | 'private' | 'friends';
  type?: 'text' | 'image' | 'video' | 'text_image';
}
```

**Response:**
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
      "shares_count": 0,
      "is_active": true,
      "created_at": "2025-11-08T10:30:00Z",
      "updated_at": "2025-11-08T10:30:00Z"
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

### 🔍 GET /publications/:id
**Descripción:** Obtener publicación por ID

**Path Parameters:**
- `id`: UUID v4 de la publicación

**Response:**
```json
{
  "success": true,
  "message": "Publicación obtenida exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "content": "Contenido de la publicación",
    "type": "text",
    "visibility": "public",
    "location": "Ciudad de México",
    "tags": ["tecnología", "desarrollo"],
    "likes_count": 15,
    "comments_count": 8,
    "shares_count": 3,
    "is_active": true,
    "created_at": "2025-11-08T10:30:00Z",
    "updated_at": "2025-11-08T10:30:00Z"
  }
}
```

### ✏️ POST /publications
**Descripción:** Crear nueva publicación

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Contenido de mi publicación",
  "type": "text",
  "visibility": "public",
  "location": "Ciudad de México",
  "tags": ["desarrollo", "javascript"]
}
```

**Validation Rules:**
- `content`: Opcional, 1-5000 caracteres si se proporciona
- `type`: Opcional, debe ser uno de: text, image, video, text_image
- `visibility`: Opcional, debe ser uno de: public, private, friends
- `location`: Opcional, máximo 255 caracteres
- `tags`: Opcional, array máximo 10 elementos

**Response:**
```json
{
  "success": true,
  "message": "Publicación creada exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "content": "Contenido de mi publicación",
    "type": "text",
    "visibility": "public",
    "location": "Ciudad de México",
    "tags": ["desarrollo", "javascript"],
    "likes_count": 0,
    "comments_count": 0,
    "shares_count": 0,
    "is_active": true,
    "created_at": "2025-11-08T10:35:00Z",
    "updated_at": "2025-11-08T10:35:00Z"
  }
}
```

### 👍 POST /publications/:id/like
**Descripción:** Dar like a una publicación

**Path Parameters:**
- `id`: UUID v4 de la publicación

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "like"
}
```

**Validation Rules:**
- `type`: Opcional, debe ser uno de: like, dislike, love, angry, sad, wow (default: like)

**Response:**
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

### 👎 DELETE /publications/:id/like
**Descripción:** Quitar like de una publicación

**Path Parameters:**
- `id`: UUID v4 de la publicación

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Like eliminado exitosamente",
  "data": {
    "publicationId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "likesCount": 15
  }
}
```

---

## 💬 Comments API

### 🔍 GET /publications/:id/comments
**Descripción:** Obtener comentarios de una publicación

**Path Parameters:**
- `id`: UUID v4 de la publicación

**Query Parameters:**
```typescript
{
  page?: number;           // Página (default: 1)
  limit?: number;          // Límite (1-50, default: 10)
  hierarchical?: boolean;  // Estructura jerárquica (default: false)
}
```

**Response (Flat Structure):**
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
        "parent_id": null,
        "content": "Excelente publicación!",
        "likes_count": 2,
        "replies_count": 1,
        "level": 1,
        "is_edited": false,
        "is_active": true,
        "created_at": "2025-11-08T10:45:00Z",
        "updated_at": "2025-11-08T10:45:00Z"
      }
    ]
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 8,
    "limit": 10,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### ✏️ POST /publications/:id/comments
**Descripción:** Agregar comentario a una publicación

**Path Parameters:**
- `id`: UUID v4 de la publicación

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Mi comentario sobre esta publicación",
  "parentId": "550e8400-e29b-41d4-a716-446655440010"
}
```

**Validation Rules:**
- `content`: Requerido, 1-2000 caracteres
- `parentId`: Opcional, debe ser UUID v4 válido de comentario existente

**Response:**
```json
{
  "success": true,
  "message": "Comentario agregado exitosamente",
  "data": {
    "comment": {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "post_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440003",
      "parent_id": "550e8400-e29b-41d4-a716-446655440010",
      "content": "Mi comentario sobre esta publicación",
      "likes_count": 0,
      "replies_count": 0,
      "level": 2,
      "is_edited": false,
      "is_active": true,
      "created_at": "2025-11-08T10:50:00Z",
      "updated_at": "2025-11-08T10:50:00Z"
    }
  }
}
```

### 🗑️ DELETE /publications/:id/comments/:commentId
**Descripción:** Eliminar comentario

**Path Parameters:**
- `id`: UUID v4 de la publicación
- `commentId`: UUID v4 del comentario

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Comentario eliminado exitosamente",
  "data": {
    "commentId": "550e8400-e29b-41d4-a716-446655440011",
    "publicationId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## 👤 User Profiles API

### ✏️ POST /profiles
**Descripción:** Crear el perfil para el usuario autenticado. El ID del usuario se obtiene del token JWT.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "displayName": "Juan Pérez",
  "bio": "Desarrollador Full Stack apasionado por la tecnología",
  "avatarUrl": "https://example.com/avatar.jpg",
  "location": "Ciudad de México",
  "website": "https://juanperez.dev",
  "birthDate": "1990-05-15",
  "gender": "male"
}
```

**Validation Rules:**
- `userId`: Requerido, UUID v4
- `displayName`: Requerido, 1-100 caracteres
- `bio`: Opcional, máximo 500 caracteres
- `avatarUrl`: Opcional, URL válida
- `location`: Opcional, máximo 100 caracteres
- `website`: Opcional, URL válida, máximo 255 caracteres
- `birthDate`: Opcional, formato YYYY-MM-DD
- `gender`: Opcional, uno de: male, female, other, prefer_not_to_say

**Response:**
```json
{
  "success": true,
  "message": "Perfil creado exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "display_name": "Juan Pérez",
    "bio": "Desarrollador Full Stack apasionado por la tecnología",
    "avatar_url": "https://example.com/avatar.jpg",
    "location": "Ciudad de México",
    "website": "https://juanperez.dev",
    "birth_date": "1990-05-15",
    "gender": "male",
    "followers_count": 0,
    "following_count": 0,
    "posts_count": 0,
    "is_verified": false,
    "is_active": true,
    "created_at": "2025-11-08T11:00:00Z",
    "updated_at": "2025-11-08T11:00:00Z"
  }
}
```

### 🔄 PUT /profiles/:userId
**Descripción:** Actualizar perfil de usuario

**Path Parameters:**
- `userId`: UUID v4 del usuario

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "bio": "Nueva biografía actualizada",
  "location": "Guadalajara, México",
  "website": "https://nuevositio.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "display_name": "Juan Pérez",
    "bio": "Nueva biografía actualizada",
    "location": "Guadalajara, México",
    "website": "https://nuevositio.com",
    "updated_at": "2025-11-08T11:15:00Z"
  }
}
```

### 🤝 POST /profiles/:userId/friends
**Descripción:** Agregar amigo

**Path Parameters:**
- `userId`: UUID v4 del usuario

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "friendId": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Response:**
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

### 🚫 POST /profiles/:userId/blocked-users
**Descripción:** Bloquear usuario

**Path Parameters:**
- `userId`: UUID v4 del usuario

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "blockedUserId": "550e8400-e29b-41d4-a716-446655440003"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario bloqueado exitosamente",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "blockedUserId": "550e8400-e29b-41d4-a716-446655440003",
    "blockedAt": "2025-11-08T11:20:00Z"
  }
}
```

---

## 🏥 Health & System Endpoints

### ❤️ GET /health
**Descripción:** Verificar estado del servicio

**Response:**
```json
{
  "success": true,
  "message": "Social Service está funcionando correctamente",
  "timestamp": "2025-11-08T11:25:00Z",
  "environment": "development"
}
```

### 📋 GET /api/v1
**Descripción:** Información de la API

**Response:**
```json
{
  "success": true,
  "message": "Social Service API v1.0",
  "version": "1.0.0",
  "endpoints": {
    "publications": "/api/v1/publications",
    "profiles": "/api/v1/profiles",
    "comments": "/api/v1/comments",
    "likes": "/api/v1/likes"
  },
  "documentation": "/api/v1/docs"
}
```

---

## 🚨 Error Responses

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "field": "content",
      "message": "El contenido debe tener entre 1 y 5000 caracteres",
      "value": ""
    },
    {
      "field": "type",
      "message": "Tipo de publicación inválido",
      "value": "invalid_type"
    }
  ]
}
```

### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Token de acceso requerido"
}
```

### Authorization Errors (403)
```json
{
  "success": false,
  "message": "Permisos insuficientes"
}
```

### Not Found Errors (404)
```json
{
  "success": false,
  "message": "Publicación no encontrada"
}
```

### Rate Limit Errors (429)
```json
{
  "success": false,
  "message": "Demasiadas solicitudes, intenta de nuevo en 15 minutos"
}
```

### Server Errors (500)
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

---

## 🔐 Authentication

**Todas las rutas (excepto health y API info) requieren autenticación JWT:**

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**JWT Payload Structure:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "email": "usuario@example.com",
  "role": "user",
  "iat": 1699440000,
  "exp": 1700044800
}
```

---

## ⚡ Rate Limiting

| **Endpoint Type** | **Limit** | **Window** |
|---|---|---|
| General API | 100 requests | 15 minutes |
| Create Publication | 20 requests | 1 hour |
| Like Actions | 50 requests | 5 minutes |
| Comments | 30 requests | 10 minutes |
| Social Actions | 10 requests | 1 hour |

---

## 💡 Frontend Integration Tips

### 1. **UUID Generation**
Usa librerías como `uuid` para generar IDs válidos:
```javascript
import { v4 as uuidv4 } from 'uuid';
const newId = uuidv4(); // "550e8400-e29b-41d4-a716-446655440000"
```

### 2. **Date Handling**
Usa `Date.toISOString()` para timestamps:
```javascript
const timestamp = new Date().toISOString(); // "2025-11-08T10:30:00.000Z"
```

### 3. **Error Handling**
```javascript
try {
  const response = await fetch('/api/v1/publications', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(publicationData)
  });
  
  const result = await response.json();
  
  if (!result.success) {
    // Manejar errores de validación
    if (result.errors) {
      result.errors.forEach(error => {
        console.error(`${error.field}: ${error.message}`);
      });
    }
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### 4. **Paginación**
```javascript
const loadMorePublications = async (page = 1, limit = 10) => {
  const response = await fetch(
    `/api/v1/publications?page=${page}&limit=${limit}`
  );
  const data = await response.json();
  
  if (data.success) {
    return {
      publications: data.data,
      hasMore: data.pagination.hasNext
    };
  }
};
```

---

## 🚀 Guía de Integración Frontend - Paso a Paso

### 📦 1. Configuración del Cliente API

#### JavaScript/TypeScript Client
```javascript
class SocialServiceAPI {
  constructor(baseURL = 'http://localhost:3001/api/v1') {
    this.baseURL = baseURL;
    this.token = null;
  }

  // Configurar token de autenticación
  setToken(token) {
    this.token = token;
  }

  // Headers por defecto
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Método base para requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.auth !== false),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }
}

// Instancia global del cliente
const api = new SocialServiceAPI();
```

### 🔐 2. Manejo de Autenticación

#### Configurar Token JWT
```javascript
// Al iniciar sesión, guardar el token
function loginUser(token) {
  // Guardar en localStorage
  localStorage.setItem('social_token', token);
  
  // Configurar en el cliente API
  api.setToken(token);
  
  // Opcional: Guardar en cookie segura
  document.cookie = `social_token=${token}; Secure; HttpOnly; SameSite=Strict`;
}

// Al cargar la aplicación, recuperar el token
function initializeAuth() {
  const token = localStorage.getItem('social_token');
  if (token) {
    api.setToken(token);
    return true;
  }
  return false;
}

// Cerrar sesión
function logoutUser() {
  localStorage.removeItem('social_token');
  api.setToken(null);
  document.cookie = 'social_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// Verificar si el usuario está autenticado
function isAuthenticated() {
  return !!api.token;
}
```

### 📝 3. Ejemplos Prácticos de Uso

#### Obtener Publicaciones
```javascript
// Función para obtener publicaciones con filtros
async function getPublications(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.userId) queryParams.append('userId', filters.userId);
    if (filters.visibility) queryParams.append('visibility', filters.visibility);
    if (filters.type) queryParams.append('type', filters.type);

    const endpoint = `/publications?${queryParams.toString()}`;
    const response = await api.request(endpoint);

    return {
      publications: response.data,
      pagination: response.pagination,
      success: true
    };
  } catch (error) {
    return {
      publications: [],
      pagination: null,
      success: false,
      error: error.message
    };
  }
}

// Ejemplo de uso en React
function PublicationsList() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    async function loadPublications() {
      setLoading(true);
      const result = await getPublications({ page: 1, limit: 10 });
      
      if (result.success) {
        setPublications(result.publications);
        setPagination(result.pagination);
      }
      setLoading(false);
    }

    loadPublications();
  }, []);

  const loadMore = async () => {
    if (pagination?.hasNext) {
      const result = await getPublications({ 
        page: pagination.currentPage + 1, 
        limit: 10 
      });
      
      if (result.success) {
        setPublications(prev => [...prev, ...result.publications]);
        setPagination(result.pagination);
      }
    }
  };

  return (
    <div>
      {publications.map(pub => (
        <div key={pub.id}>
          <p>{pub.content}</p>
          <span>{pub.likes_count} likes</span>
        </div>
      ))}
      
      {pagination?.hasNext && (
        <button onClick={loadMore}>Cargar más</button>
      )}
    </div>
  );
}
```

#### Crear Nueva Publicación
```javascript
async function createPublication(publicationData) {
  try {
    const response = await api.request('/publications', {
      method: 'POST',
      body: JSON.stringify({
        content: publicationData.content,
        type: publicationData.type || 'text',
        visibility: publicationData.visibility || 'public',
        location: publicationData.location,
        tags: publicationData.tags
      })
    });

    return {
      success: true,
      publication: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejemplo de formulario en React
function CreatePublicationForm() {
  const [content, setContent] = useState('');
  const [type, setType] = useState('text');
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('El contenido es requerido');
      return;
    }

    setLoading(true);
    const result = await createPublication({
      content: content.trim(),
      type,
      visibility
    });

    if (result.success) {
      setContent('');
      alert('Publicación creada exitosamente!');
      // Actualizar lista de publicaciones
    } else {
      alert(`Error: ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="¿Qué estás pensando?"
        maxLength={5000}
        required
      />
      
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="text">Solo Texto</option>
        <option value="image">Imagen</option>
        <option value="video">Video</option>
        <option value="text_image">Texto e Imagen</option>
      </select>

      <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
        <option value="public">Público</option>
        <option value="friends">Solo Amigos</option>
        <option value="private">Privado</option>
      </select>

      <button type="submit" disabled={loading}>
        {loading ? 'Publicando...' : 'Publicar'}
      </button>
    </form>
  );
}
```

#### Dar/Quitar Like
```javascript
async function toggleLike(publicationId, currentlyLiked = false) {
  try {
    const method = currentlyLiked ? 'DELETE' : 'POST';
    const endpoint = `/publications/${publicationId}/like`;
    
    const response = await api.request(endpoint, { method });

    return {
      success: true,
      liked: !currentlyLiked,
      likesCount: response.data.likesCount
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Componente de botón de like
function LikeButton({ publicationId, initialLikesCount = 0, initialLiked = false }) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para dar like');
      return;
    }

    setLoading(true);
    const result = await toggleLike(publicationId, liked);

    if (result.success) {
      setLiked(result.liked);
      setLikesCount(result.likesCount);
    } else {
      alert(`Error: ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleLike} 
      disabled={loading}
      className={`like-btn ${liked ? 'liked' : ''}`}
    >
      {liked ? '❤️' : '🤍'} {likesCount}
    </button>
  );
}
```

#### Comentarios
```javascript
async function getComments(publicationId, page = 1) {
  try {
    const response = await api.request(
      `/publications/${publicationId}/comments?page=${page}&hierarchical=true`
    );

    return {
      success: true,
      comments: response.data.comments,
      totalComments: response.data.totalComments,
      pagination: response.pagination
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function addComment(publicationId, content, parentId = null) {
  try {
    const response = await api.request(`/publications/${publicationId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        content: content.trim(),
        parentId
      })
    });

    return {
      success: true,
      comment: response.data.comment
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Componente de comentarios
function CommentsSection({ publicationId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [publicationId]);

  const loadComments = async () => {
    const result = await getComments(publicationId);
    if (result.success) {
      setComments(result.comments);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para comentar');
      return;
    }

    setLoading(true);
    const result = await addComment(publicationId, newComment);

    if (result.success) {
      setNewComment('');
      await loadComments(); // Recargar comentarios
    } else {
      alert(`Error: ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="comments-section">
      <h3>Comentarios ({comments.length})</h3>
      
      <form onSubmit={handleAddComment}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          maxLength={2000}
          rows={3}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Comentando...' : 'Comentar'}
        </button>
      </form>

      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className={`comment level-${comment.level}`}>
            <p>{comment.content}</p>
            <small>
              {new Date(comment.created_at).toLocaleDateString()}
              {comment.is_edited && ' (editado)'}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 🏗️ 4. Configuración de Estado Global (Redux/Context)

#### Context API para React
```javascript
// API Context
const APIContext = createContext();

export function APIProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('social_token'));

  useEffect(() => {
    if (token) {
      api.setToken(token);
      // Aquí podrías obtener datos del usuario
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('social_token', newToken);
    api.setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('social_token');
    api.setToken(null);
  };

  return (
    <APIContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      login,
      logout,
      api
    }}>
      {children}
    </APIContext.Provider>
  );
}

export const useAPI = () => {
  const context = useContext(APIContext);
  if (!context) {
    throw new Error('useAPI must be used within APIProvider');
  }
  return context;
};
```

### ⚠️ 5. Manejo Robusto de Errores

```javascript
// Interceptor de errores global
api.addErrorInterceptor = function(callback) {
  const originalRequest = this.request;
  
  this.request = async function(endpoint, options) {
    try {
      return await originalRequest.call(this, endpoint, options);
    } catch (error) {
      // Manejo específico de errores
      if (error.message.includes('401')) {
        // Token expirado
        localStorage.removeItem('social_token');
        window.location.href = '/login';
        return;
      }
      
      if (error.message.includes('429')) {
        // Rate limit
        alert('Demasiadas solicitudes. Espera un momento e intenta de nuevo.');
        return;
      }
      
      // Callback personalizado
      if (callback) callback(error);
      throw error;
    }
  };
};

// Configurar interceptor
api.addErrorInterceptor((error) => {
  console.error('Global API Error:', error);
  // Aquí podrías mostrar notificaciones globales
});
```

### 📱 6. Configuración para Diferentes Entornos

```javascript
// config.js
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3001/api/v1',
    WS_URL: 'ws://localhost:3001'
  },
  production: {
    API_BASE_URL: 'https://api.tudominio.com/api/v1',
    WS_URL: 'wss://api.tudominio.com'
  }
};

const env = process.env.NODE_ENV || 'development';
export const API_CONFIG = config[env];

// Inicializar cliente con configuración
const api = new SocialServiceAPI(API_CONFIG.API_BASE_URL);
```

### 🎯 7. TypeScript Definitions

```typescript
// types/api.ts
export interface Publication {
  id: string;
  user_id: string;
  content?: string;
  type: 'text' | 'image' | 'video' | 'text_image' | 'text_video';
  visibility: 'public' | 'private' | 'friends';
  location?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
  pagination?: PaginationMeta;
}

export interface CreatePublicationRequest {
  content?: string;
  type?: Publication['type'];
  visibility?: Publication['visibility'];
  location?: string;
  tags?: string[];
}

// Hook tipado para React
export function usePublications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPublications = async (filters?: PublicationFilters) => {
    setLoading(true);
    try {
      const response = await api.request<Publication[]>('/publications');
      if (response.success) {
        setPublications(response.data || []);
      }
    } catch (error) {
      console.error('Error loading publications:', error);
    } finally {
      setLoading(false);
    }
  };

  return { publications, loading, loadPublications };
}
```

---

**Generado el:** 8 de noviembre de 2025  
**Responsable:** Sistema de Documentación API  
**Estado:** ✅ Especificación completa para integración frontend