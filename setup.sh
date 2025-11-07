#!/bin/bash

# ===============================================
# setup.sh - Script de Despliegue Automatizado para Auth Service y API Gateway
# ===============================================

echo "Iniciando el script de despliegue automatizado para Auth Service y API Gateway..."

# --- 1. Definición de Variables ---
PROJECT_ROOT=$(pwd)
AUTH_SERVICE_DIR="$PROJECT_ROOT/auth-service"
API_GATEWAY_DIR="$PROJECT_ROOT/api-gateway"

POSTGRES_USER="aura_auth_user"
POSTGRES_PASSWORD="aurapassword" # ¡ATENCIÓN: Cambiar por una contraseña segura en producción!
POSTGRES_DB="aura_auth_db"
JWT_SECRET="your_very_long_and_complex_jwt_secret_key_for_auth" # ¡ATENCIÓN: Generar y gestionar de forma segura en producción!

AUTH_SERVICE_PORT=3001
API_GATEWAY_PORT=3000

# --- 2. Funciones de Comprobación e Instalación de Requisitos ---

check_and_install() {
    local cmd_name=$1
    local install_cmd=$2
    local pkg_name=$3

    if ! command -v "$cmd_name" &> /dev/null; then
        echo "$cmd_name no está instalado. Instalando..."
        sudo apt update
        sudo apt install -y "$install_cmd" || { echo "Error instalando $pkg_name. Abortando."; exit 1; }
    else
        echo "$cmd_name ya está instalado."
    fi
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "Docker no está instalado. Instalando Docker..."
        # Scripts oficiales de Docker
        sudo apt update
        sudo apt install -y ca-certificates curl gnupg
        sudo install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        sudo chmod a+r /etc/apt/keyrings/docker.gpg
        echo \
          "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          \"$(. /etc/os-release && echo "$VERSION_CODENAME")\" stable" | \
          sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt update
        sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin || { echo "Error instalando Docker. Abortando."; exit 1; }

        echo "Añadiendo el usuario actual al grupo docker para ejecutar comandos sin sudo..."
        sudo usermod -aG docker "$USER"
        echo "========================================================================"
        echo "¡IMPORTANTE: Docker se acaba de instalar y/o tu usuario se añadió al grupo 'docker'!"
        echo "Necesitas CERRAR Y VOLVER A INICIAR TU SESIÓN SSH (o reiniciar la instancia) para que los permisos surtan efecto."
        echo "Por favor, cierra esta sesión y conéctate de nuevo. Luego, ejecuta este script otra vez."
        echo "========================================================================"
        exit 0 # Sale del script, el usuario debe re-ejecutarlo
    else
        echo "Docker ya está instalado."
        # Verificar si el usuario está en el grupo docker si Docker ya estaba instalado
        if ! id -nG "$USER" | grep -qw "docker"; then
            echo "El usuario '$USER' no está en el grupo 'docker', intentando añadirlo..."
            sudo usermod -aG docker "$USER"
            echo "========================================================================"
            echo "¡IMPORTANTE: Tu usuario se añadió al grupo 'docker'!"
            echo "Necesitas CERRAR Y VOLVER A INICIAR TU SESIÓN SSH (o reiniciar la instancia) para que los permisos surtan efecto."
            echo "Por favor, cierra esta sesión y conéctate de nuevo. Luego, ejecuta este script otra vez."
            echo "========================================================================"
            exit 0 # Sale del script
        fi
    fi

    # Verificar si docker compose funciona sin sudo
    if ! docker compose version &> /dev/null; then
        echo "Error: docker-compose plugin no parece estar funcionando o no tienes permisos sin sudo."
        echo "========================================================================"
        echo "¡Advertencia crítica! Docker compose no responde o no tienes los permisos correctos."
        echo "Asegúrate de haber reiniciado tu terminal o sesión SSH después de añadirte al grupo 'docker'."
        echo "Por favor, verifica manualmente el estado de Docker y docker-compose."
        echo "========================================================================"
        exit 1
    else
        echo "Docker y docker-compose funcionan correctamente."
    fi
}

# --- 3. Ejecución de Comprobaciones ---
echo -e "\n--- Verificando e instalando requisitos del sistema ---"
check_docker


# --- 4. Crear Dockerfile para el Auth Service ---
echo -e "\n--- Creando Dockerfile para auth-service ---"
cat <<EOF > "$AUTH_SERVICE_DIR/Dockerfile"
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE ${AUTH_SERVICE_PORT}
CMD [ "npm", "start" ]
EOF
echo "Dockerfile creado en $AUTH_SERVICE_DIR/Dockerfile"


# --- 5. Crear Dockerfile para el API Gateway ---
echo -e "\n--- Creando Dockerfile para api-gateway ---"
cat <<EOF > "$API_GATEWAY_DIR/Dockerfile"
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE ${API_GATEWAY_PORT}
CMD [ "npm", "start" ]
EOF
echo "Dockerfile creado en $API_GATEWAY_DIR/Dockerfile"


# --- 6. Crear archivo docker-compose.yml ---
echo -e "\n--- Creando docker-compose.yml ---"
# Eliminar la línea 'version' obsoleta
cat <<EOF > "$PROJECT_ROOT/docker-compose.yml"
services:
  db:
    image: postgres:15-alpine
    container_name: auth_db
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - auth_db_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5

  auth-service:
    build:
      context: ./auth-service
      dockerfile: Dockerfile
    container_name: auth_microservice
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public
      JWT_SECRET: ${JWT_SECRET}
      PORT: ${AUTH_SERVICE_PORT}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  api-gateway:
    build:
      context: ./api-gateway
      dockerfile: Dockerfile
    container_name: api_gateway
    environment:
      PORT: ${API_GATEWAY_PORT}
      JWT_SECRET: ${JWT_SECRET}
      AUTH_SERVICE_URL: http://auth_microservice:${AUTH_SERVICE_PORT}
    ports:
      - "${API_GATEWAY_PORT}:${API_GATEWAY_PORT}"
    depends_on:
      auth-service:
        condition: service_started
    restart: unless-stopped

volumes:
  auth_db_data:
EOF
echo "docker-compose.yml creado en $PROJECT_ROOT/docker-compose.yml"

# --- 7. Crear script SQL de inicialización para Docker Compose ---
echo -e "\n--- Creando init.sql para la base de datos ---"
cat <<EOF > "$PROJECT_ROOT/init.sql"
-- init.sql
-- Script para inicializar la base de datos PostgreSQL con roles

-- Crear la tabla de roles si no existe
CREATE TABLE IF NOT EXISTS roles (
    id_role SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar los roles básicos si no existen
INSERT INTO roles (role_name) VALUES ('admin') ON CONFLICT (role_name) DO NOTHING;
INSERT INTO roles (role_name) VALUES ('user') ON CONFLICT (role_name) DO NOTHING;

-- Crear la tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    id_role INTEGER NOT NULL DEFAULT (SELECT id_role FROM roles WHERE role_name = 'user'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_role
        FOREIGN KEY (id_role)
        REFERENCES roles (id_role)
        ON DELETE RESTRICT
);
EOF
echo "init.sql creado en $PROJECT_ROOT/init.sql"


# --- 8. Desplegar el proyecto con Docker Compose ---
echo -e "\n--- Desplegando los servicios con Docker Compose ---"
cd "$PROJECT_ROOT" || { echo "Error: No se pudo cambiar al directorio raíz del proyecto."; exit 1; }

# Intentar desplegar. Si falla por permisos, el script ya habrá salido antes
docker compose up --build -d || { echo "Error al desplegar los servicios Docker. Abortando."; exit 1; }

echo -e "\n--- Proceso de despliegue completado ---"
echo "Los servicios de PostgreSQL, Auth Service y API Gateway han sido levantados."
echo "API Gateway debería estar accesible en http://localhost:${API_GATEWAY_PORT}"
echo "Puedes ver los logs con: docker compose logs -f"
echo "Para detener los servicios: docker compose down"
echo "Para reiniciar un servicio (ej. auth-service): docker compose up --build -d auth-service"