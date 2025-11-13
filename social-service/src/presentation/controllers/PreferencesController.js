const { UserPreferenceModel } = require('../../infrastructure/database/models');
const { v4: uuidv4 } = require('uuid');

class PreferencesController {
  constructor() {
    // Bind methods para mantener contexto
    this.getUserPreferences = this.getUserPreferences.bind(this);
    this.createUserPreferences = this.createUserPreferences.bind(this);
    this.updateUserPreferences = this.updateUserPreferences.bind(this);
    this.deleteUserPreferences = this.deleteUserPreferences.bind(this);
    this.getAvailablePreferences = this.getAvailablePreferences.bind(this);
  }

  /**
   * Obtener preferencias de un usuario específico
   */
  async getUserPreferences(req, res) {
    try {
      const userId = req.user.id; // Del JWT token
      
      console.log('📋 GetUserPreferences - User:', userId);

      const userPreferences = await UserPreferenceModel.findOne({
        where: { user_id: userId }
      });

      if (!userPreferences) {
        // Retornar preferencias vacías si no existen
        return res.status(200).json({
          success: true,
          message: 'Preferencias obtenidas exitosamente',
          data: {
            user_id: userId,
            preferences: []
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Preferencias obtenidas exitosamente',
        data: userPreferences
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Crear preferencias para un usuario
   */
  async createUserPreferences(req, res) {
    try {
      const userId = req.user.id;
      const { preferences } = req.body;

      console.log('📝 CreateUserPreferences - User:', userId, 'Preferences:', preferences);

      // Validar que preferences sea un array
      if (!Array.isArray(preferences)) {
        return res.status(400).json({
          success: false,
          message: 'Las preferencias deben ser un array'
        });
      }

      // Validar preferencias disponibles
      const validPreferences = [
        'Deportes', 'Arte', 'Musica', 'Lectura', 'Tecnologia', 
        'Naturaleza', 'Voluntariado', 'Gaming', 'Fotografia', 
        'Cocina', 'Baile', 'Meditacion'
      ];

      const invalidPreferences = preferences.filter(pref => !validPreferences.includes(pref));
      if (invalidPreferences.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Preferencias inválidas: ${invalidPreferences.join(', ')}`,
          validPreferences
        });
      }

      // Verificar si ya existen preferencias para el usuario
      const existingPreferences = await UserPreferenceModel.findOne({
        where: { user_id: userId }
      });

      if (existingPreferences) {
        return res.status(400).json({
          success: false,
          message: 'El usuario ya tiene preferencias configuradas. Use PUT para actualizar.'
        });
      }

      // Crear nuevas preferencias
      const userPreferences = await UserPreferenceModel.create({
        id: uuidv4(),
        user_id: userId,
        preferences: [...new Set(preferences)] // Eliminar duplicados
      });

      console.log('✅ Preferencias creadas exitosamente:', userId);

      res.status(201).json({
        success: true,
        message: 'Preferencias creadas exitosamente',
        data: userPreferences
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Actualizar preferencias de un usuario
   */
  async updateUserPreferences(req, res) {
    try {
      const userId = req.user.id;
      const { preferences } = req.body;

      console.log('✏️ UpdateUserPreferences - User:', userId, 'New Preferences:', preferences);

      // Validar que preferences sea un array
      if (!Array.isArray(preferences)) {
        return res.status(400).json({
          success: false,
          message: 'Las preferencias deben ser un array'
        });
      }

      // Validar preferencias disponibles
      const validPreferences = [
        'Deportes', 'Arte', 'Musica', 'Lectura', 'Tecnologia', 
        'Naturaleza', 'Voluntariado', 'Gaming', 'Fotografia', 
        'Cocina', 'Baile', 'Meditacion'
      ];

      const invalidPreferences = preferences.filter(pref => !validPreferences.includes(pref));
      if (invalidPreferences.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Preferencias inválidas: ${invalidPreferences.join(', ')}`,
          validPreferences
        });
      }

      // Buscar preferencias existentes
      let userPreferences = await UserPreferenceModel.findOne({
        where: { user_id: userId }
      });

      if (!userPreferences) {
        // Si no existen, crear nuevas
        userPreferences = await UserPreferenceModel.create({
          id: uuidv4(),
          user_id: userId,
          preferences: [...new Set(preferences)]
        });

        console.log('✅ Preferencias creadas (no existían previamente):', userId);

        return res.status(201).json({
          success: true,
          message: 'Preferencias creadas exitosamente',
          data: userPreferences
        });
      }

      // Actualizar preferencias existentes
      await userPreferences.update({
        preferences: [...new Set(preferences)]
      });

      console.log('✅ Preferencias actualizadas exitosamente:', userId);

      res.status(200).json({
        success: true,
        message: 'Preferencias actualizadas exitosamente',
        data: userPreferences
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Eliminar preferencias de un usuario
   */
  async deleteUserPreferences(req, res) {
    try {
      const userId = req.user.id;

      console.log('🗑️ DeleteUserPreferences - User:', userId);

      const userPreferences = await UserPreferenceModel.findOne({
        where: { user_id: userId }
      });

      if (!userPreferences) {
        return res.status(404).json({
          success: false,
          message: 'No se encontraron preferencias para eliminar'
        });
      }

      // Eliminar preferencias
      await userPreferences.destroy();

      console.log('✅ Preferencias eliminadas exitosamente:', userId);

      res.status(200).json({
        success: true,
        message: 'Preferencias eliminadas exitosamente'
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Obtener lista de preferencias disponibles
   */
  async getAvailablePreferences(req, res) {
    try {
      const availablePreferences = [
        {
          key: 'Deportes',
          name: 'Deportes',
          description: 'Actividades físicas y deportivas'
        },
        {
          key: 'Arte',
          name: 'Arte',
          description: 'Pintura, escultura, arte visual'
        },
        {
          key: 'Musica',
          name: 'Música',
          description: 'Instrumentos, géneros musicales, conciertos'
        },
        {
          key: 'Lectura',
          name: 'Lectura',
          description: 'Libros, literatura, escritura'
        },
        {
          key: 'Tecnologia',
          name: 'Tecnología',
          description: 'Programación, gadgets, innovación'
        },
        {
          key: 'Naturaleza',
          name: 'Naturaleza',
          description: 'Senderismo, ecología, vida al aire libre'
        },
        {
          key: 'Voluntariado',
          name: 'Voluntariado',
          description: 'Ayuda social, causas benéficas'
        },
        {
          key: 'Gaming',
          name: 'Gaming',
          description: 'Videojuegos, esports, streaming'
        },
        {
          key: 'Fotografia',
          name: 'Fotografía',
          description: 'Fotografía, edición, arte visual'
        },
        {
          key: 'Cocina',
          name: 'Cocina',
          description: 'Recetas, gastronomía, repostería'
        },
        {
          key: 'Baile',
          name: 'Baile',
          description: 'Danza, coreografía, ritmo'
        },
        {
          key: 'Meditacion',
          name: 'Meditación',
          description: 'Mindfulness, yoga, bienestar mental'
        }
      ];

      res.status(200).json({
        success: true,
        message: 'Preferencias disponibles obtenidas exitosamente',
        data: availablePreferences
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  _handleError(res, error) {
    console.error('Error en PreferencesController:', error.message);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: error.errors.map(e => e.message)
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existen preferencias para este usuario'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = PreferencesController;