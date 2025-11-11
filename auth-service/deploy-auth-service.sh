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
# Determina el directorio donde se encuentra este script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# Si el script está en 'auth-service', entonces SCRIPT_DIR es AUTH_SERVICE_DIR y PROJECT_ROOT es su padre.
AUTH_SERVICE_DIR="$SCRIPT_DIR"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

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
# Forzar la terminación de todas las conexiones a la base de datos antes de eliminarla
echo "Terminando conexiones existentes a la base de datos '$POSTGRES_DB'..."
sudo -u postgres psql -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${POSTGRES_DB}' AND pid <> pg_backend_pid();"

# Ahora sí, eliminar la base de datos y el usuario para una configuración limpia
echo "Eliminando la base de datos '$POSTGRES_DB' si existe..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${POSTGRES_DB} WITH (FORCE);"
echo "Eliminando usuario '$POSTGRES_USER' si existe..."
sudo -u postgres psql -c "DROP USER IF EXISTS ${POSTGRES_USER};"

# Crear el usuario en PostgreSQL
echo "Creando usuario de base de datos: $POSTGRES_USER"
sudo -u postgres psql -c "CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';"

# Crear la base de datos en PostgreSQL
echo "Creando base de datos: $POSTGRES_DB"
sudo -u postgres psql -c "CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};"

# --- 4. Instalación de Dependencias y Migración de la Base de Datos ---

echo -e "\n--- ⚙️  Instalando dependencias y preparando la aplicación ---"

# Instalar las dependencias de Node.js
echo "Instalando dependencias de npm en $AUTH_SERVICE_DIR..."
cd "$AUTH_SERVICE_DIR"
npm install

# Ejecutar las migraciones de Prisma para crear el esquema de la base de datos
echo "Ejecutando migraciones de Prisma..."
npx prisma migrate deploy
echo "✅ Migración de la base de datos completada."

# Insertar los roles por defecto si no existen
echo "Insertando roles por defecto ('admin', 'user')..."
sudo -u postgres psql -d "$POSTGRES_DB" -c "INSERT INTO roles (role_name) VALUES ('admin'), ('user') ON CONFLICT (role_name) DO NOTHING;"
echo "✅ Roles por defecto insertados."

echo -e "\n\n🎉 ¡Todo listo! 🎉"
echo "El entorno ha sido configurado exitosamente."
echo "Luego, ejecuta el servicio con: npm run dev"