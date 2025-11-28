#!/bin/bash

# =================================================================
# Script de Configuración de Entorno para Social Service en Ubuntu Server
#
# Este script realiza las siguientes tareas:
# 1. Verifica e instala Node.js (con npm) y MySQL Server si no existen.
# 2. Lee las credenciales del archivo .env para la base de datos.
# 3. Crea el usuario y la base de datos en MySQL.
# 4. Instala las dependencias del proyecto con 'npm install'.
# 5. Ejecuta las migraciones y los seeds de la aplicación.
# =================================================================

set -e # Salir inmediatamente si un comando falla.

echo "🚀 Iniciando la configuración del entorno para Social Service..."

# --- 1. Definición de Variables ---
# Determina el directorio donde se encuentra este script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ENV_FILE="$SCRIPT_DIR/.env"

# --- 2. Verificación e Instalación de Dependencias del Sistema ---

echo -e "\n--- 🔎 Verificando e instalando requisitos del sistema ---"

# Función para verificar si un comando existe.
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

# Asegurarse de que npm esté en el PATH para la sesión actual del script
if ! command_exists npm; then
    export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"
    echo "💡 PATH actualizado para incluir npm."
fi

# Verificar e instalar MariaDB Server
if ! command_exists mysql; then
    echo "MariaDB Server no está instalado. Instalando..."
    sudo apt-get update
    sudo apt-get install -y mariadb-server mariadb-client
else
    echo "✅ MariaDB Server ya está instalado."
fi

# --- 3. Lectura de Credenciales y Configuración de la Base de Datos ---

echo -e "\n--- 🐘 Configurando la base de datos MySQL ---"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: El archivo .env no se encuentra en $SCRIPT_DIR. No se pueden obtener las credenciales de la base de datos."
    exit 1
fi

# Cargar variables desde el archivo .env
export $(grep -v '^#' "$ENV_FILE" | xargs)

DB_USER=${DB_USER:-posts_user}
DB_PASSWORD=${DB_PASSWORD:-posts123}
DB_NAME=${DB_NAME:-posts_dev_db}

echo "Usando credenciales del .env (o valores por defecto): Usuario='${DB_USER}', Base de Datos='${DB_NAME}'"

SETUP_SCRIPT_PATH="$SCRIPT_DIR/database-setup.sql"

echo "Ejecutando el script de configuración de la base de datos: database-setup.sql..."
echo "A continuación, se te pedirá la contraseña de root de MariaDB para continuar."
sudo mariadb -u root -p < "$SETUP_SCRIPT_PATH"

echo "✅ Base de datos y usuario configurados."

# --- 4. Instalación de Dependencias y Migración de la Base de Datos ---

echo -e "\n--- ⚙️  Instalando dependencias y preparando la aplicación ---"

# Instalar las dependencias de Node.js
echo "Instalando dependencias de npm en $SCRIPT_DIR..."
cd "$SCRIPT_DIR"
npm install

# Ejecutar las migraciones de Sequelize para crear el esquema de la base de datos
echo "Ejecutando migraciones de la aplicación..."
npm run migrate:up
echo "✅ Migración de la base de datos completada."

# Ejecutar los seeds para poblar la base de datos con datos iniciales
echo "Ejecutando seeds..."
npm run seed
echo "✅ Seeds ejecutados correctamente."

echo -e "\n\n🎉 ¡Todo listo! 🎉"
echo "El entorno para Social Service ha sido configurado exitosamente."
echo "Para iniciar el servicio, ejecuta: npm run dev"