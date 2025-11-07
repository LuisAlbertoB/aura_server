// api-gateway/src/utils/errorHandlers.js
module.exports = {
    notFoundHandler: (req, reply) => {
        reply.code(404).send({ message: 'Route not found' });
    },
    errorHandler: (error, req, reply) => {
        req.log.error(error); // Registrar el error completo para depuración
        let statusCode = error.statusCode || 500;
        let message = error.message || 'Internal server error';

        if (error.code === 'FST_JWT_AUTH_FAILED') {
            statusCode = 401;
            message = 'Unauthorized: Invalid or expired token.';
        } else if (error.code === 'FST_RATE_LIMIT') {
             statusCode = 429;
             message = 'Too many requests. Please try again later.';
        }
        // Puedes añadir más lógica para diferentes tipos de errores aquí

        reply.code(statusCode).send({ message: message });
    }
};