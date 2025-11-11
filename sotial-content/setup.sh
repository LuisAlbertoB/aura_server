#!/bin/bash

# =================================================================
# Script de Configuración Automática para Social Service
#
# Este script automatiza los siguientes pasos:
# 1. Verifica la instalación y el estado de MySQL.
# 2. Crea la base de datos y el usuario necesarios.
# 3. Instala las dependencias del proyecto (npm).
# 4. Ejecuta las migraciones de la base de datos.
# 5. Inicia la aplicación en modo de desarrollo.
# =================================================================

# --- Colores para una salida más clara ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando la configuración del entorno para Social Service...${NC}\n"

# --- PASO 1: VERIFICAR MYSQL ---
echo -e "${YELLOW}Paso 1: Verificando instalación y estado de MySQL...${NC}"

# Verificar si el comando mysql está disponible
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ Error: MySQL no está instalado. Por favor, instala MySQL Server y vuelve a ejecutar el script.${NC}"
    exit 1
fi

# Verificar si el servicio MySQL está activo (usando systemctl, el más común)
if command -v systemctl &> /dev/null; then
    if ! systemctl is-active --quiet mysql; then
        echo "El servicio de MySQL no está activo. Se necesita permiso de superusuario para iniciarlo."
        sudo systemctl start mysql
        if ! systemctl is-active --quiet mysql; then
            echo -e "${RED}❌ Error: No se pudo iniciar el servicio de MySQL. Por favor, inícialo manualmente e inténtalo de nuevo.${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ Servicio de MySQL iniciado correctamente.${NC}"
    else
        echo -e "${GREEN}✅ El servicio de MySQL ya está en ejecución.${NC}"
    fi
else
    echo -e "${YELLOW}Aviso: No se encontró 'systemctl'. Se omite la verificación del estado del servicio MySQL. Asegúrate de que esté corriendo.${NC}"
fi
echo ""

# --- PASO 2: CONFIGURAR BASE DE DATOS Y USUARIO ---
echo -e "${YELLOW}Paso 2: Creando la base de datos y el usuario...${NC}"
echo "Se te pedirá la contraseña de 'root' de MySQL para continuar."

if mysql -u root -p < database-setup.sql; then
    echo -e "${GREEN}✅ Base de datos 'posts_dev_db' y usuario 'posts_user' creados con éxito.${NC}"
else
    echo -e "${RED}❌ Error al ejecutar 'database-setup.sql'. Verifica la contraseña de root o si el usuario ya existe con una contraseña diferente.${NC}"
    exit 1
fi
echo ""

# --- PASO 3: INSTALAR DEPENDENCIAS ---
echo -e "${YELLOW}Paso 3: Instalando dependencias del proyecto con npm...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Dependencias instaladas correctamente.${NC}"
else
    echo -e "${RED}❌ Error durante 'npm install'. Verifica tu conexión a internet y la configuración de npm.${NC}"
    exit 1
fi
echo ""

# --- PASO 4: EJECUTAR MIGRACIONES ---
echo -e "${YELLOW}Paso 4: Ejecutando migraciones de la base de datos...${NC}"
if npm run migrate:up; then
    echo -e "${GREEN}✅ Migraciones ejecutadas con éxito. Las tablas han sido creadas.${NC}"
else
    echo -e "${RED}❌ Error al ejecutar las migraciones. Revisa los logs para más detalles.${NC}"
    exit 1
fi
echo ""

# --- PASO 5: INICIAR LA APLICACIÓN ---
echo -e "${YELLOW}Paso 5: Iniciando la aplicación en modo desarrollo...${NC}"
echo -e "${GREEN}🎉 ¡Configuración completada! El servidor se está iniciando.${NC}"
npm run dev