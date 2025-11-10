const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Validación de Consistencia: Verificar si el usuario o email ya existen
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }
        const existingUsername = await prisma.user.findUnique({ where: { username } });
        if (existingUsername) {
            return res.status(409).json({ message: 'Username is already taken.' });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Crear el usuario con el rol por defecto 'user' (asumiendo id_role=2)
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password_hash,
                role: {
                    connect: { role_name: 'user' } // Conectar al rol 'user'
                }
            },
            select: {
                user_id: true,
                username: true,
                email: true,
                role: { select: { role_name: true } },
                createdAt: true
            }
        });

        // Generar un token JWT para el nuevo usuario
        const token = jwt.sign(
            { id: newUser.user_id, role: newUser.role.role_name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expira en 1 hora
        );

        res.status(201).json({ message: 'User registered successfully.', user: newUser, token });

    } catch (error) {
        console.error('Registration error:', error);
        // Gestión de Errores Adecuada: No revelar detalles internos del error
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });

        if (!user) {
            // Mensaje genérico para no dar pistas sobre si el email existe o no
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: user.user_id, role: user.role.role_name },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expira en 1 hora
        );

        res.status(200).json({ message: 'Logged in successfully.', token });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
};

const getProfile = async (req, res) => {
    try {
        // req.userId y req.userRole vienen del middleware verifyToken
        const user = await prisma.user.findUnique({
            where: { user_id: req.userId },
            select: {
                user_id: true,
                username: true,
                email: true,
                role: { select: { role_name: true } },
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error retrieving profile.' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                user_id: true,
                username: true,
                email: true,
                role: { select: { role_name: true } },
                createdAt: true
            }
        });
        res.status(200).json({ users });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Internal server error retrieving users.' });
    }
};

const updateInterests = async (req, res) => {
    // El ID del usuario se obtiene del token JWT verificado por el middleware
    const userId = req.userId;
    const { interests } = req.body;

    // Validación básica de la entrada
    if (!Array.isArray(interests) || interests.some(i => typeof i !== 'string')) {
        return res.status(400).json({ message: "Interests must be an array of strings." });
    }

    try {
        // Usamos 'upsert' para crear el perfil si no existe, o actualizarlo si ya existe.
        // Esto es muy robusto y evita errores si el usuario guarda intereses por primera vez.
        const userProfile = await prisma.userProfile.upsert({
            where: { user_id: userId },
            update: {
                interests: interests, // Sobrescribe el array de intereses
            },
            create: {
                user_id: userId,
                interests: interests,
                // Los otros campos del perfil (fullname, bio) se crearán como NULL
            },
        });

        res.status(200).json({ message: "Interests saved successfully.", interests: userProfile.interests });
    } catch (error) {
        console.error('Error saving interests:', error);
        res.status(500).json({ message: "Internal server error while processing the request." });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    getAllUsers,
    updateInterests,
};