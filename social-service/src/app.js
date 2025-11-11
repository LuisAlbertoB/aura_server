const SocialServiceApp = require('./SocialServiceApp');

// Inicializar y ejecutar la aplicación
async function main() {
  try {
    const app = new SocialServiceApp();
    await app.initialize();
    await app.start();
  } catch (error) {
    console.error(' Error fatal al iniciar Social Service:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SocialServiceApp;