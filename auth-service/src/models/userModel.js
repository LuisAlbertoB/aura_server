const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Busca un usuario por su dirección de email.
 * @param {string} email - El email del usuario.
 * @param {boolean} [includeRole=false] - Si es true, incluye la información del rol relacionado.
 * @returns {Promise<Object|null>} El objeto de usuario o null si no se encuentra.
 */
const findUserByEmail = async (email, includeRole = false) => {
    return prisma.user.findUnique({
        where: { email },
        include: { role: includeRole },
    });
};

/**
 * Busca un usuario por su nombre de usuario.
 * @param {string} username - El nombre de usuario.
 * @returns {Promise<Object|null>} El objeto de usuario o null si no se encuentra.
 */
const findUserByUsername = async (username) => {
    return prisma.user.findUnique({
        where: { username },
    });
};

/**
 * Busca un usuario por su ID.
 * @param {string} userId - El ID único del usuario.
 * @returns {Promise<Object|null>} El objeto de usuario con campos seleccionados o null si no se encuentra.
 */
const findUserById = async (userId) => {
    return prisma.user.findUnique({
        where: { user_id: userId },
        select: {
            user_id: true,
            username: true,
            email: true,
            role: { select: { role_name: true } },
            createdAt: true,
        },
    });
};

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {Object} userData - Los datos del usuario a crear (username, email, password_hash, id_role).
 * @returns {Promise<Object>} El nuevo objeto de usuario creado.
 */
const createUser = async (userData) => {
    return prisma.user.create({
        data: userData,
        select: {
            user_id: true,
            username: true,
            email: true,
            createdAt: true,
        },
    });
};

/**
 * Obtiene todos los usuarios de la base de datos.
 * @returns {Promise<Array<Object>>} Un array con todos los usuarios.
 */
const findAllUsers = async () => {
    return prisma.user.findMany({
        select: {
            user_id: true,
            username: true,
            email: true,
            role: { select: { role_name: true } },
            createdAt: true,
        },
    });
};

module.exports = {
    findUserByEmail,
    findUserByUsername,
    findUserById,
    createUser,
    findAllUsers,
};