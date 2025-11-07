// api-gateway/src/routes/services/authRoutes.js
module.exports = async function (fastify, opts) {
    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

    // Rutas que NO requieren autenticación en el Gateway (manejadas por auth-service)
    fastify.createProxy('/api/auth/register', AUTH_SERVICE_URL, {
        rewritePrefix: '/api/auth/register' // Enviar a /api/auth/register en el backend
    });

    fastify.createProxy('/api/auth/login', AUTH_SERVICE_URL, {
        rewritePrefix: '/api/auth/login' // Enviar a /api/auth/login en el backend
    });

    // Rutas que REQUIEREN autenticación en el Gateway
    // El 'authenticate' hook se ejecutará antes de hacer proxy
    fastify.createProxy('/api/auth/profile', AUTH_SERVICE_URL, {
        rewritePrefix: '/api/auth/profile',
        preHandler: fastify.authenticate // Aplica la verificación JWT
    });

    fastify.createProxy('/api/auth/users', AUTH_SERVICE_URL, {
        rewritePrefix: '/api/auth/users',
        preHandler: async (request, reply) => {
            // Primero autentica, luego verifica el rol
            await fastify.authenticate(request, reply);
            if (reply.sent) return; // Si authenticate ya envió una respuesta, parar

            if (request.userRole !== 'admin') {
                reply.code(403).send({ message: 'Forbidden: Admin access required.' });
                return;
            }
        }
    });

    fastify.log.info('Auth service routes loaded.');
};