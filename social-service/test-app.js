#!/usr/bin/env node

/**
 * Script de verificación rápida para testear que la aplicación se inicie correctamente
 */

const path = require('path');

async function testApp() {
  try {
    console.log('🔍 Verificando aplicación Social Service...\n');

    // Test 1: Verificar que la aplicación se puede importar
    console.log('1. Importando SocialServiceApp...');
    const SocialServiceApp = require('./src/SocialServiceApp');
    console.log('✅ SocialServiceApp importado correctamente');

    // Test 2: Intentar crear una instancia
    console.log('2. Creando instancia de la aplicación...');
    const app = new SocialServiceApp();
    console.log('✅ Instancia creada correctamente');

    // Test 3: Intentar inicializar (pero no iniciar servidor)
    console.log('3. Inicializando aplicación...');
    await app.initialize();
    console.log('✅ Aplicación inicializada correctamente');

    console.log('\n🎉 ¡Todas las verificaciones pasaron! La aplicación está lista para ejecutarse.');

    // Cerrar conexiones
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error durante la verificación:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Ejecutar test si se llama directamente
if (require.main === module) {
  testApp();
}

module.exports = testApp;