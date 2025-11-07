// api-gateway/src/plugins/authPlugin.js
const fp = require('fastify-plugin');
const jwt = require('jsonwebtoken');

module.exports = fp(async (fastify, options) => {
    // Decorador para verificar JWT
    fastify.decorate('authenticate', async (request, reply) => {
        try {
            const authHeader = request.headers['authorization'];
            if (!authHeader) {
                reply.code(401).send({ message: 'Unauthorized: No token provided.' });
                return;
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                reply.code(401).send({ message: 'Unauthorized: Token format is incorrect.' });
                return;
            }

            const decoded = await new Promise((resolve, reject) => {
                jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(decoded);
                });
            });

            // Añadir información del usuario decodificada al request
            // Para que los microservicios backend puedan usarla si es necesario
            request.userId = decoded.id;
            request.userRole = decoded.role;
            request.headers['X-User-ID'] = decoded.id;
            request.headers['X-User-Role'] = decoded.role;

        } catch (err) {
            request.log.error('JWT verification failed:', err.message);
            // Errores de JWT
            if (err.name === 'TokenExpiredError') {
                reply.code(401).send({ code: 'FST_JWT_AUTH_FAILED', message: 'Unauthorized: Token expired.' });
            } else if (err.name === 'JsonWebTokenError') {
                reply.code(401).send({ code: 'FST_JWT_AUTH_FAILED', message: 'Unauthorized: Invalid token.' });
            } else {
                reply.code(500).send({ message: 'Authentication failed due to server error.' });
            }
        }
    });

    fastify.log.info('Authentication plugin loaded.');
});