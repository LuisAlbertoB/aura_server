// api-gateway/src/routes/index.js
module.exports = async function (fastify, opts) {
    // Registrar rutas para el microservicio de autenticación
    fastify.register(require('./services/authRoutes'));

    // Aquí puedes registrar rutas para otros microservicios en el futuro
    // Ejemplo:
    // fastify.register(require('./services/productsRoutes'));
    // fastify.register(require('./services/ordersRoutes'));
};