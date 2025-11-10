#!/bin/bash

# =================================================================
# Script de Despliegue Automatizado para Auth Service en Ubuntu Server
#
# Este script instala y configura todo el stack necesario para
# ejecutar el auth-service de forma persistente.
# - Instala Node.js, PostgreSQL y PM2.
# - Configura la base de datos y las credenciales.
# - Instala dependencias del proyecto.
# - Migra la base de datos.
# - Inicia el servicio con PM2 para persistencia.
# =================================================================

set -e # Salir inmediatamente si un comando falla

echo "🚀 Iniciando el despliegue completo del Auth Service..."

# --- 1. Definición de Variables ---
PROJECT_ROOT=$(pwd)
AUTH_SERVICE_DIR="$PROJECT_ROOT/auth-service"

# Credenciales para la base de datos (¡Gestionar de forma segura en producción!)
POSTGRES_USER="aura_auth_user"
POSTGRES_PASSWORD="aurapassword"
POSTGRES_DB="aura_auth_db"

# Variables para el servicio
AUTH_SERVICE_PORT=3001
JWT_SECRET="your_very_long_and_complex_jwt_secret_key_for_auth"

# --- 2. Verificación e Instalación del Stack de Requisitos ---

echo -e "\n--- 🔎 Verificando e instalando requisitos del sistema ---"

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" &> /dev/null
}

# Instalar Node.js v20 y npm
if ! command_exists node || ! node -v | grep -q "v20"; then
    echo "Node.js v20 no está instalado. Instalando..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js ya está instalado."
fi

# Instalar PostgreSQL
if ! command_exists psql; then
    echo "PostgreSQL no está instalado. Instalando..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
else
    echo "✅ PostgreSQL ya está instalado."
fi

# Instalar PM2 globalmente
if ! command_exists pm2; then
    echo "PM2 no está instalado. Instalando globalmente..."
    sudo npm install -g pm2
else
    echo "✅ PM2 ya está instalado."
fi

# --- 3. Configuración de la Base de Datos PostgreSQL ---

echo -e "\n--- 🐘 Configurando la base de datos PostgreSQL ---"

# Crear usuario si no existe
if ! sudo -u postgres psql -t -c '\du' | cut -d \| -f 1 | grep -qw "$POSTGRES_USER"; then
    echo "Creando usuario de base de datos: $POSTGRES_USER"
    sudo -u postgres psql -c "CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';"
else
    echo "✅ El usuario de la base de datos '$POSTGRES_USER' ya existe."
fi

# Crear base de datos si no existe
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$POSTGRES_DB"; then
    echo "Creando base de datos: $POSTGRES_DB"
    sudo -u postgres psql -c "CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};"
else
    echo "✅ La base de datos '$POSTGRES_DB' ya existe."
fi

# --- 4. Preparación y Migración del Auth Service ---

echo -e "\n--- ⚙️  Preparando y migrando el Auth Service ---"

# Crear archivo .env si no existe
if [ ! -f "$AUTH_SERVICE_DIR/.env" ]; then
    echo "Creando archivo de configuración .env..."
    cat <<EOF > "$AUTH_SERVICE_DIR/.env"
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"
JWT_SECRET="${JWT_SECRET}"
PORT=${AUTH_SERVICE_PORT}
EOF
else
    echo "✅ El archivo .env ya existe."
fi

# Instalar dependencias del proyecto
echo "Instalando dependencias de npm en $AUTH_SERVICE_DIR..."
cd "$AUTH_SERVICE_DIR"
npm install

# Generar cliente Prisma
echo "Generando cliente Prisma..."
npx prisma generate

# Crear y ejecutar script de migración SQL
echo "Creando y ejecutando script de inicialización de la base de datos (init.sql)..."
cat <<EOF > "$PROJECT_ROOT/init.sql"
-- Crear la tabla de roles si no existe
CREATE TABLE IF NOT EXISTS roles (
    id_role SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Insertar los roles básicos si no existen
INSERT INTO roles (role_name) VALUES ('admin'), ('user') ON CONFLICT (role_name) DO NOTHING;
-- Crear la tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    id_role INTEGER NOT NULL DEFAULT (SELECT id_role FROM roles WHERE role_name = 'user'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_role FOREIGN KEY (id_role) REFERENCES roles (id_role) ON DELETE RESTRICT
);
EOF

# Ejecutar el script SQL en la base de datos
sudo -u postgres psql -d "$POSTGRES_DB" -f "$PROJECT_ROOT/init.sql"
echo "✅ Migración de la base de datos completada."

# --- 5. Despliegue Persistente con PM2 ---

echo -e "\n--- 🚀 Desplegando el servicio con PM2 para ejecución persistente ---"
cd "$AUTH_SERVICE_DIR"

# Iniciar o reiniciar el servicio usando PM2
pm2 start "npm run dev" --name "auth-service" --time

# Configurar PM2 para que se inicie al arrancar el sistema
echo "Configurando PM2 para arrancar al inicio del sistema..."
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u "$(whoami)" --hp "$HOME"

echo -e "\n\n🎉 ¡Despliegue completado! 🎉"
echo "El 'auth-service' ahora se está ejecutando de forma persistente a través de PM2."
echo "Para ver el estado del servicio, ejecuta: pm2 status"
echo "Para ver los logs en tiempo real, ejecuta: pm2 logs auth-service"
echo "Para detener el servicio, ejecuta: pm2 stop auth-service"

