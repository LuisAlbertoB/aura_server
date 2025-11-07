// api-gateway/src/plugins/securityPlugin.js
const fp = require('fastify-plugin');
const helmet = require('helmet');

module.exports = fp(async (fastify, options) => {
    // 1. CORS
    fastify.register(require('@fastify/cors'), {
        origin: '*', // Permite todas las solicitudes de origen. Ajusta esto en producción!
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    });

    // 2. Helmet (integrado como middleware Fastify)
    // Fastify tiene su propio enfoque para middlewares, aquí se integra Helmet
    fastify.addHook('onRequest', (request, reply, done) => {
        helmet()(request.raw, reply.raw, done);
    });

    // 3. Rate Limiting
    fastify.register(require('@fastify/rate-limit'), {
        max: 100, // Máximo 100 peticiones por ventana
        timeWindow: '1 minute', // En una ventana de 1 minuto
        logLimitData: true,
        // Configuración para el mensaje de error de rate limiting
        errorResponseBuilder: (request, context) => {
            return {
                code: 'FST_RATE_LIMIT',
                message: 'Too many requests. Please try again later.',
                statusCode: 429
            };
        }
    });

    fastify.log.info('Security plugins (CORS, Helmet, Rate Limit) loaded.');
});