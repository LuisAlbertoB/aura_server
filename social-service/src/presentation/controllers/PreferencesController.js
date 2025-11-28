// presentation/controllers/PreferencesController.js
const { UserPreferenceModel } = require('../../infrastructure/database/models');
const { v4: uuidv4 } = require('uuid');

class PreferencesController {
  constructor() {
    this.getUserPreferences = this.getUserPreferences.bind(this);
    this.createUserPreferences = this.createUserPreferences.bind(this);
    this.updateUserPreferences = this.updateUserPreferences.bind(this);
    this.deleteUserPreferences = this.deleteUserPreferences.bind(this);
    this.getAvailablePreferences = this.getAvailablePreferences.bind(this);
    
    // Validar que el modelo se cargó correctamente
    if (!UserPreferenceModel) {
      console.error('❌ ERROR CRÍTICO: UserPreferenceModel no está disponible');
    } else {
      console.log('✅ UserPreferenceModel cargado correctamente');
    }
  }

  getValidPreferences() {
    return [
      'Deportes', 'Arte', 'Música', 'Lectura', 'Tecnología', 
      'Naturaleza', 'Voluntariado', 'Gaming', 'Fotografía', 
      'Cocina', 'Baile', 'Meditación'
    ];
  }

  async getUserPreferences(req, res) {
    try {
      const userId = req.user.id;
      
      console.log('📋 GetUserPreferences - User:', userId);

      const userPreferences = await UserPreferenceModel.findOne({
        where: { user_id: userId }
      });

      if (!userPreferences) {
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

  async createUserPreferences(req, res) {
    try {
      const userId = req.user.id;
      let preferencesData = req.body;

      console.log('📝 CreateUserPreferences - User:', userId);
      console.log('📝 Type of req.body:', typeof req.body, Array.isArray(req.body));
      console.log('📝 Raw req.body:', JSON.stringify(req.body));

      if (!Array.isArray(preferencesData)) {
        if (preferencesData && preferencesData.preferences) {
          preferencesData = preferencesData.preferences;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Las preferencias deben ser un array'
          });
        }
      }

      const preferenceNames = preferencesData.map(pref => {
        if (typeof pref === 'string') {
          return pref;
        } else if (pref && pref.category) {
          return pref.category;
        } else if (pref && pref.name) {
          return pref.name;
        }
        return null;
      }).filter(name => name !== null);

      console.log('📝 Nombres extraídos:', preferenceNames);

      const validPreferences = this.getValidPreferences();
      const invalidPreferences = preferenceNames.filter(pref => !validPreferences.includes(pref));
      
      if (invalidPreferences.length > 0) {
        console.log('❌ Preferencias inválidas encontradas:', invalidPreferences);
        console.log('✅ Preferencias válidas:', validPreferences);
        return res.status(400).json({
          success: false,
          message: `Preferencias inválidas: ${invalidPreferences.join(', ')}`,
          validPreferences
        });
      }

      const existingPreferences = await UserPreferenceModel.findOne({
        where: { user_id: userId }
      });

      if (existingPreferences) {
        await existingPreferences.update({
          preferences: [...new Set(preferenceNames)]
        });

        console.log('✅ Preferencias actualizadas exitosamente:', userId);

        return res.status(200).json({
          success: true,
          message: 'Preferencias actualizadas exitosamente',
          data: existingPreferences
        });
      }

      const userPreferences = await UserPreferenceModel.create({
        id: uuidv4(),
        user_id: userId,
        preferences: [...new Set(preferenceNames)]
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

  async updateUserPreferences(req, res) {
    try {
      const userId = req.user.id;
      let preferencesData = req.body;

      console.log('✏️ UpdateUserPreferences - User:', userId);
      console.log('✏️ Type of req.body:', typeof req.body, Array.isArray(req.body));
      console.log('✏️ Raw req.body:', JSON.stringify(req.body));

      if (!Array.isArray(preferencesData)) {
        if (preferencesData && preferencesData.preferences) {
          preferencesData = preferencesData.preferences;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Las preferencias deben ser un array'
          });
        }
      }

      const preferenceNames = preferencesData.map(pref => {
        if (typeof pref === 'string') {
          return pref;
        } else if (pref && pref.category) {
          return pref.category;
        } else if (pref && pref.name) {
          return pref.name;
        }
        return null;
      }).filter(name => name !== null);

      console.log('📝 Nombres extraídos:', preferenceNames);

      const validPreferences = this.getValidPreferences();
      const invalidPreferences = preferenceNames.filter(pref => !validPreferences.includes(pref));
      
      if (invalidPreferences.length > 0) {
        console.log('❌ Preferencias inválidas encontradas:', invalidPreferences);
        console.log('✅ Preferencias válidas:', validPreferences);
        return res.status(400).json({
          success: false,
          message: `Preferencias inválidas: ${invalidPreferences.join(', ')}`,
          validPreferences
        });
      }

      let userPreferences = await UserPreferenceModel.findOne({
        where: { user_id: userId }
      });

      if (!userPreferences) {
        userPreferences = await UserPreferenceModel.create({
          id: uuidv4(),
          user_id: userId,
          preferences: [...new Set(preferenceNames)]
        });

        console.log('✅ Preferencias creadas (no existían):', userId);

        return res.status(201).json({
          success: true,
          message: 'Preferencias creadas exitosamente',
          data: userPreferences
        });
      }

      await userPreferences.update({
        preferences: [...new Set(preferenceNames)]
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

  async getAvailablePreferences(req, res) {
    try {
      const availablePreferences = [
        {
          key: 'Deportes',
          name: 'Deportes',
          description: 'Actividades físicas y deportivas',
          icono: '⚽'
        },
        {
          key: 'Arte',
          name: 'Arte',
          description: 'Pintura, escultura, arte visual',
          icono: '🎨'
        },
        {
          key: 'Música',
          name: 'Música',
          description: 'Instrumentos, géneros musicales, conciertos',
          icono: '🎵'
        },
        {
          key: 'Lectura',
          name: 'Lectura',
          description: 'Libros, literatura, escritura',
          icono: '📚'
        },
        {
          key: 'Tecnología',
          name: 'Tecnología',
          description: 'Programación, gadgets, innovación',
          icono: '💻'
        },
        {
          key: 'Naturaleza',
          name: 'Naturaleza',
          description: 'Senderismo, ecología, vida al aire libre',
          icono: '🌿'
        },
        {
          key: 'Voluntariado',
          name: 'Voluntariado',
          description: 'Ayuda social, causas benéficas',
          icono: '🤝'
        },
        {
          key: 'Gaming',
          name: 'Gaming',
          description: 'Videojuegos, esports, streaming',
          icono: '🎮'
        },
        {
          key: 'Fotografía',
          name: 'Fotografía',
          description: 'Fotografía, edición, arte visual',
          icono: '📷'
        },
        {
          key: 'Cocina',
          name: 'Cocina',
          description: 'Recetas, gastronomía, repostería',
          icono: '🍳'
        },
        {
          key: 'Baile',
          name: 'Baile',
          description: 'Danza, coreografía, ritmo',
          icono: '💃'
        },
        {
          key: 'Meditación',
          name: 'Meditación',
          description: 'Mindfulness, yoga, bienestar mental',
          icono: '🧘'
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

  _handleError(res, error) {
    console.error('❌ Error en PreferencesController:', error.message);
    console.error('Stack:', error.stack);
    
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
