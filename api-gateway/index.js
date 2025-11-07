// api-gateway/index.js
require('dotenv').config();
const fastify = require('fastify');
const { notFoundHandler, errorHandler } = require('./src/utils/errorHandlers');

const app = fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
            }
        }
    }
});

const PORT = process.env.PORT || 3000;

// --- Configuración de Manejo de Errores ---
app.setErrorHandler(errorHandler);
app.setNotFoundHandler(notFoundHandler);

// --- Cargar Plugins ---
app.register(require('./src/plugins/securityPlugin'));
app.register(require('./src/plugins/authPlugin'));
app.register(require('./src/plugins/proxyPlugin'));

// --- Cargar Rutas ---
app.register(require('./src/routes'));

// --- Iniciar Servidor ---
const start = async () => {
    try {
        await app.listen({ port: PORT, host: '0.0.0.0' }); // Escuchar en todas las interfaces
        app.log.info(`API Gateway running on http://localhost:${PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();