// api-gateway/src/plugins/proxyPlugin.js
const fp = require('fastify-plugin');
const proxy = require('fastify-http-proxy');

module.exports = fp(async (fastify, options) => {
    // Función para crear un proxy genérico
    fastify.decorate('createProxy', (prefix, upstream, opts = {}) => {
        fastify.register(proxy, {
            upstream: upstream,
            prefix: prefix,
            replyCoalescing: true, // Mejorar el rendimiento de conexión
            httpMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Permitir todos los métodos
            rewritePrefix: opts.rewritePrefix === false ? prefix : (opts.rewritePrefix || prefix), // Por defecto reescribe
            preHandler: opts.preHandler, // Custom preHandler para lógica antes del proxy
            // Otros hooks y opciones de proxy pueden ir aquí (ej. onError, onResponse)
            ...opts
        });
        fastify.log.info(`Proxy configured: ${prefix} -> ${upstream}`);
    });

    fastify.log.info('Proxy plugin loaded.');
});