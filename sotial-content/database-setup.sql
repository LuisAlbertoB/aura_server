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