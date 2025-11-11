const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const roleModel = require('../models/roleModel'); // Importar el nuevo modelo de rol
const userModel = require('../models/userModel'); // Importar el modelo de usuario

const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Validación de Consistencia: Verificar si el usuario o email ya existen
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const existingUsername = await userModel.findUserByUsername(username);
        if (existingUsername) {
            return res.status(409).json({ message: 'Username is already taken.' });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Obtener el rol 'user' usando el modelo de rol
        const userRole = await roleModel.findRoleByName('user');
        if (!userRole) {
            // Este es un error crítico del sistema, el rol 'user' debe existir
            console.error("Default 'user' role not found in database.");
            return res.status(500).json({ message: 'System configuration error.' });
        }

        // Crear el usuario y asignarle el id_role obtenido
        const newUser = await userModel.createUser({
            username,
            email,
            password_hash,
            id_role: userRole.id_role,
        });
        
        // Generar un token JWT para el nuevo usuario
        const token = jwt.sign(
            { id: newUser.user_id, role: userRole.role_name }, // Usar el nombre del rol obtenido
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
        const user = await userModel.findUserByEmail(email, true); // Incluir el rol

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
        const user = await userModel.findUserById(req.userId);

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
        const users = await userModel.findAllUsers();
        res.status(200).json({ users });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Internal server error retrieving users.' });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    getAllUsers,
};