-- ================================================================
-- SOCIAL SERVICE - BASE DE DATOS COMPLETA
-- Estructura exacta que coincide con los modelos Sequelize
-- ================================================================

-- 1. CREAR BASE DE DATOS Y USUARIO
DROP DATABASE IF EXISTS posts_dev_db;
CREATE DATABASE posts_dev_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario y dar permisos
CREATE USER IF NOT EXISTS 'posts_user'@'localhost' IDENTIFIED BY 'posts123';
GRANT ALL PRIVILEGES ON posts_dev_db.* TO 'posts_user'@'localhost';
FLUSH PRIVILEGES;

-- Usar la base de datos
USE posts_dev_db;

-- ================================================================
-- 2. TABLA POSTS (Publicaciones)
-- ================================================================
CREATE TABLE posts (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL COMMENT 'ID del usuario que creó el post',
  content TEXT COMMENT 'Contenido de texto del post',
  type ENUM('text', 'image', 'video', 'text_image', 'text_video') NOT NULL DEFAULT 'text' COMMENT 'Tipo de contenido del post',
  visibility ENUM('public', 'private', 'friends') NOT NULL DEFAULT 'public' COMMENT 'Visibilidad del post',
  location VARCHAR(255) COMMENT 'Ubicación asociada al post',
  tags JSON COMMENT 'Tags o etiquetas del post',
  metadata JSON COMMENT 'Metadatos adicionales del post',
  likes_count INT NOT NULL DEFAULT 0 COMMENT 'Contador de likes',
  comments_count INT NOT NULL DEFAULT 0 COMMENT 'Contador de comentarios',
  shares_count INT NOT NULL DEFAULT 0 COMMENT 'Contador de compartidos',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Estado activo del post',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices para POSTS
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_is_active ON posts(is_active);
CREATE INDEX idx_posts_user_visibility_active ON posts(user_id, visibility, is_active);

-- ================================================================
-- 3. TABLA MEDIA (Archivos multimedia)
-- ================================================================
CREATE TABLE media (
  id CHAR(36) PRIMARY KEY,
  post_id CHAR(36) NOT NULL COMMENT 'ID del post al que pertenece el archivo',
  type ENUM('image', 'video', 'audio', 'document') NOT NULL COMMENT 'Tipo de archivo multimedia',
  url TEXT NOT NULL COMMENT 'URL del archivo en Cloudinary o storage',
  public_id VARCHAR(500) COMMENT 'Public ID de Cloudinary para gestión del archivo',
  original_name VARCHAR(500) COMMENT 'Nombre original del archivo',
  mime_type VARCHAR(100) COMMENT 'Tipo MIME del archivo',
  size BIGINT COMMENT 'Tamaño del archivo en bytes',
  width INT COMMENT 'Ancho en píxeles (para imágenes y videos)',
  height INT COMMENT 'Alto en píxeles (para imágenes y videos)',
  duration FLOAT COMMENT 'Duración en segundos (para videos y audios)',
  format VARCHAR(20) COMMENT 'Formato del archivo (jpg, png, mp4, etc.)',
  alt_text TEXT COMMENT 'Texto alternativo para accesibilidad',
  metadata JSON COMMENT 'Metadatos adicionales del archivo',
  order_position INT NOT NULL DEFAULT 1 COMMENT 'Posición de orden en el post',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Indica si es el archivo principal del post',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Key
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices para MEDIA
CREATE INDEX idx_media_post_id ON media(post_id);
CREATE INDEX idx_media_type ON media(type);
CREATE INDEX idx_media_post_order ON media(post_id, order_position);
CREATE INDEX idx_media_post_primary ON media(post_id, is_primary);

-- ================================================================
-- 4. TABLA COMMENTS (Comentarios)
-- ================================================================
CREATE TABLE comments (
  id CHAR(36) PRIMARY KEY,
  post_id CHAR(36) NOT NULL COMMENT 'ID del post al que pertenece el comentario',
  user_id CHAR(36) NOT NULL COMMENT 'ID del usuario que hizo el comentario',
  parent_id CHAR(36) COMMENT 'ID del comentario padre (para respuestas)',
  content TEXT NOT NULL COMMENT 'Contenido del comentario',
  likes_count INT NOT NULL DEFAULT 0 COMMENT 'Contador de likes del comentario',
  replies_count INT NOT NULL DEFAULT 0 COMMENT 'Contador de respuestas',
  level INT NOT NULL DEFAULT 1 COMMENT 'Nivel de anidación del comentario',
  is_edited BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Indica si el comentario fue editado',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Estado activo del comentario',
  edited_at TIMESTAMP NULL COMMENT 'Fecha de última edición',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices para COMMENTS
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_post_parent ON comments(post_id, parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_is_active ON comments(is_active);

-- ================================================================
-- 5. TABLA LIKES (Me gusta / Reacciones)
-- ================================================================
CREATE TABLE likes (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL COMMENT 'ID del usuario que dio el like',
  likeable_type ENUM('post', 'comment') NOT NULL COMMENT 'Tipo de entidad que recibió el like',
  likeable_id CHAR(36) NOT NULL COMMENT 'ID de la entidad que recibió el like',
  type ENUM('like', 'dislike', 'love', 'angry', 'sad', 'wow') NOT NULL DEFAULT 'like' COMMENT 'Tipo de reacción',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices para LIKES
CREATE UNIQUE INDEX idx_likes_user_likeable_unique ON likes(user_id, likeable_type, likeable_id);
CREATE INDEX idx_likes_likeable ON likes(likeable_type, likeable_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_type ON likes(type);
CREATE INDEX idx_likes_created_at ON likes(created_at);

-- ================================================================
-- 6. TABLA USER_PROFILES (Perfiles de usuario extendidos)
-- ================================================================
CREATE TABLE user_profiles (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE COMMENT 'ID del usuario (referencia externa)',
  display_name VARCHAR(100) NOT NULL COMMENT 'Nombre a mostrar',
  bio TEXT COMMENT 'Biografía del usuario',
  avatar_url TEXT COMMENT 'URL del avatar',
  cover_url TEXT COMMENT 'URL de imagen de portada',
  location VARCHAR(100) COMMENT 'Ubicación del usuario',
  website VARCHAR(255) COMMENT 'Sitio web personal',
  birth_date DATE COMMENT 'Fecha de nacimiento',
  gender ENUM('male', 'female', 'other', 'prefer_not_to_say') COMMENT 'Género',
  privacy_settings JSON COMMENT 'Configuraciones de privacidad',
  preferences JSON COMMENT 'Preferencias del usuario',
  followers_count INT NOT NULL DEFAULT 0 COMMENT 'Número de seguidores',
  following_count INT NOT NULL DEFAULT 0 COMMENT 'Número de usuarios seguidos',
  posts_count INT NOT NULL DEFAULT 0 COMMENT 'Número de publicaciones',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Cuenta verificada',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Cuenta activa',
  last_active_at TIMESTAMP NULL COMMENT 'Última actividad',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices para USER_PROFILES
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_display_name ON user_profiles(display_name);
CREATE INDEX idx_user_profiles_is_verified ON user_profiles(is_verified);
CREATE INDEX idx_user_profiles_is_active ON user_profiles(is_active);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);

-- ================================================================
-- 7. TABLA INTERESTS (Intereses de usuarios)
-- ================================================================
CREATE TABLE interests (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL COMMENT 'ID del usuario',
  name VARCHAR(50) NOT NULL COMMENT 'Nombre del interés',
  category VARCHAR(30) COMMENT 'Categoría del interés',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Key
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices para INTERESTS
CREATE INDEX idx_interests_user_id ON interests(user_id);
CREATE INDEX idx_interests_name ON interests(name);
CREATE INDEX idx_interests_category ON interests(category);
CREATE UNIQUE INDEX idx_interests_user_name_unique ON interests(user_id, name);

-- ================================================================
-- 8. TABLA FRIENDSHIPS (Relaciones de amistad)
-- ================================================================
CREATE TABLE friendships (
  id CHAR(36) PRIMARY KEY,
  requester_id CHAR(36) NOT NULL COMMENT 'Usuario que envió la solicitud',
  addressee_id CHAR(36) NOT NULL COMMENT 'Usuario que recibió la solicitud',
  status ENUM('pending', 'accepted', 'declined', 'blocked') NOT NULL DEFAULT 'pending' COMMENT 'Estado de la amistad',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Evitar duplicados
  UNIQUE KEY unique_friendship (requester_id, addressee_id)
);

-- Índices para FRIENDSHIPS
CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_friendships_status ON friendships(status);
CREATE INDEX idx_friendships_both_users ON friendships(requester_id, addressee_id);

-- ================================================================
-- 9. TABLA BLOCKED_USERS (Usuarios bloqueados)
-- ================================================================
CREATE TABLE blocked_users (
  id CHAR(36) PRIMARY KEY,
  blocker_id CHAR(36) NOT NULL COMMENT 'Usuario que bloquea',
  blocked_id CHAR(36) NOT NULL COMMENT 'Usuario bloqueado',
  reason VARCHAR(255) COMMENT 'Razón del bloqueo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Evitar duplicados
  UNIQUE KEY unique_block (blocker_id, blocked_id)
);

-- Índices para BLOCKED_USERS
CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_id);

-- ================================================================
-- 10. DATOS DE EJEMPLO PARA TESTING
-- ================================================================

-- Insertar un perfil de usuario de prueba
INSERT INTO user_profiles (
  id, 
  user_id, 
  display_name, 
  bio, 
  avatar_url
) VALUES (
  UUID(), 
  'test-user-123', 
  'Usuario de Prueba', 
  'Este es un usuario de prueba para el Social Service', 
  'https://via.placeholder.com/150'
);

-- ================================================================
-- VERIFICACIÓN DE LA ESTRUCTURA
-- ================================================================

-- Mostrar todas las tablas creadas
SHOW TABLES;

-- Mostrar estructura de la tabla principal
DESCRIBE posts;

-- Verificar que el usuario de prueba se insertó
SELECT * FROM user_profiles WHERE user_id = 'test-user-123';

-- ================================================================
-- NOTAS IMPORTANTES
-- ================================================================
/*
1. Todas las tablas usan CHAR(36) para UUIDs en lugar de AUTO_INCREMENT
2. Los campos coinciden exactamente con los modelos Sequelize
3. Se incluyen todas las Foreign Keys necesarias
4. Los índices están optimizados para las consultas más comunes
5. Se incluye un usuario de prueba para testing inmediato
6. Los ENUM values coinciden con los definidos en los modelos
7. Los timestamps usan CURRENT_TIMESTAMP para compatibilidad
*/