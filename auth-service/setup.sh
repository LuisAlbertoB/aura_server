#!/bin/bash

# =================================================================
# Script de Configuración de Entorno para Auth Service en Ubuntu Server
#
# Este script realiza las siguientes tareas:
# 1. Verifica e instala Node.js (con npm) y PostgreSQL si no existen.
# 2. Lee las credenciales del archivo .env existente.
# 3. Crea el usuario y la base de datos en PostgreSQL.
# 4. Instala las dependencias del proyecto con 'npm install'.
# 5. Crea e inicializa las tablas de la base de datos.
# =================================================================

set -e # Salir inmediatamente si un comando falla.

echo "🚀 Iniciando la configuración del entorno para Auth Service..."

# --- 1. Definición de Variables ---
# Navega al directorio del script para asegurar que las rutas relativas funcionen
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")" # Sube un nivel para llegar a la raíz del proyecto
AUTH_SERVICE_DIR="$PROJECT_ROOT/auth-service"

# Credenciales para la base de datos (usadas directamente)
POSTGRES_USER="aura_auth_user"
POSTGRES_PASSWORD="aurapassword"
POSTGRES_DB="aura_auth_db"

# --- 2. Verificación e Instalación de Dependencias del Sistema ---

echo -e "\n--- 🔎 Verificando e instalando requisitos del sistema ---"

# Función para verificar si un comando (como 'node' o 'psql') existe.
command_exists() {
    command -v "$1" &> /dev/null
}

# Verificar e instalar Node.js v20 (incluye npm)
if ! command_exists node || ! node -v | grep -q "v20"; then
    echo "Node.js v20 no está instalado. Instalando..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js ya está instalado."
fi

# Verificar e instalar PostgreSQL
if ! command_exists psql; then
    echo "PostgreSQL no está instalado. Instalando..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
else
    echo "✅ PostgreSQL ya está instalado."
fi

# --- 3. Lectura de Credenciales y Configuración de la Base de Datos ---

echo -e "\n--- 🐘 Configurando la base de datos PostgreSQL ---"

echo "Usando credenciales predefinidas: Usuario='${POSTGRES_USER}', Base de Datos='${POSTGRES_DB}'"

# Crear el usuario en PostgreSQL si no existe
if ! sudo -u postgres psql -t -c '\du' | cut -d \| -f 1 | grep -qw "$POSTGRES_USER"; then
    echo "Creando usuario de base de datos: $POSTGRES_USER"
    sudo -u postgres psql -c "CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';"
else
    echo "✅ El usuario de la base de datos '$POSTGRES_USER' ya existe."
fi

# Crear la base de datos en PostgreSQL si no existe
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$POSTGRES_DB"; then
    echo "Creando base de datos: $POSTGRES_DB"
    sudo -u postgres psql -c "CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};"
else
    echo "✅ La base de datos '$POSTGRES_DB' ya existe."
fi

# --- 4. Instalación de Dependencias y Migración de la Base de Datos ---

echo -e "\n--- ⚙️  Instalando dependencias y preparando la aplicación ---"

# Instalar las dependencias de Node.js
echo "Instalando dependencias de npm en $AUTH_SERVICE_DIR..."
cd "$AUTH_SERVICE_DIR"
npm install

# Crear el script SQL para la migración
echo "Creando script de inicialización de la base de datos (init.sql)..."
cat <<EOF > "$PROJECT_ROOT/init.sql"
CREATE TABLE IF NOT EXISTS roles (
    id_role SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO roles (role_name) VALUES ('admin'), ('user') ON CONFLICT (role_name) DO NOTHING;
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

# Ejecutar la migración en la base de datos
echo "Ejecutando migración de la base de datos..."
sudo -u postgres psql -d "$POSTGRES_DB" -f "$PROJECT_ROOT/init.sql"
echo "✅ Migración de la base de datos completada."

echo -e "\n\n🎉 ¡Todo listo! 🎉"
echo "El entorno ha sido configurado exitosamente."
echo "Navega al directorio del servicio con: cd auth-service"
echo "Luego, ejecuta el servicio con: npm run dev"
