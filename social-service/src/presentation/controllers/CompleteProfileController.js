const { CompleteProfileModel, UserProfileModel } = require('../../infrastructure/database/models');
const { v4: uuidv4 } = require('uuid');

class CompleteProfileController {
  constructor() {
    // Bind methods para mantener contexto
    this.getCompleteProfile = this.getCompleteProfile.bind(this);
    this.createCompleteProfile = this.createCompleteProfile.bind(this);
    this.updateCompleteProfile = this.updateCompleteProfile.bind(this);
    this.deleteCompleteProfile = this.deleteCompleteProfile.bind(this);
    this.getUserCompleteProfile = this.getUserCompleteProfile.bind(this);
  }

  /**
   * Obtener perfil completo del usuario autenticado
   */
  async getCompleteProfile(req, res) {
    try {
      const userId = req.user.id; // Del JWT token
      
      console.log('📋 GetCompleteProfile - User:', userId);

      const completeProfile = await CompleteProfileModel.findOne({
            attributes: ['user_id', 'display_name', 'avatar_url']
      });

      if (!completeProfile) {
        // Retornar perfil vacío si no existe
        const userProfile = await UserProfileModel.findByPk(userId, {
          attributes: ['user_id', 'display_name', 'avatar_url']
        });

        return res.status(200).json({
          success: true,
          message: 'Perfil completo obtenido exitosamente',
          data: {
            user_id: userId,
            fullName: null,
            age: null,
            profile_picture: null,
            bio: null,
            hobbies: [],
            location: null,
            website: null,
            phone: null,
            user: userProfile
          }
        });
      }

      res.status(200).json({
        success: true,
        message: 'Perfil completo obtenido exitosamente',
        data: completeProfile
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Obtener perfil completo de cualquier usuario (público)
   */
  async getUserCompleteProfile(req, res) {
    try {
      const { userId } = req.params;
      
      console.log('👤 GetUserCompleteProfile - Target User:', userId);

      const completeProfile = await CompleteProfileModel.findOne({
        where: { user_id: userId },
        include: [
          {
            model: UserProfileModel,
            as: 'user',
            attributes: ['user_id', 'display_name', 'username', 'avatar_url', 'created_at']
          }
        ]
      });

      if (!completeProfile) {
        // Retornar información básica del usuario si no tiene perfil completo
        const userProfile = await UserProfileModel.findByPk(userId, {
          attributes: ['user_id', 'display_name', 'username', 'avatar_url', 'created_at']
        });

        if (!userProfile) {
          return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Perfil básico obtenido exitosamente',
          data: {
            user_id: userId,
            full_name: null,
            age: null,
            profile_picture: null,
            bio: null,
            hobbies: [],
            location: null,
            website: null,
            phone: null, // No mostrar teléfono en perfil público
            user: userProfile
          }
        });
      }

      // No mostrar información privada (teléfono) en perfil público
      const publicProfile = completeProfile.toJSON();
      publicProfile.phone = null;

      res.status(200).json({
        success: true,
        message: 'Perfil completo obtenido exitosamente',
        data: publicProfile
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Crear perfil completo para un usuario
   */
  async createCompleteProfile(req, res) {
    try {
      const userId = req.user.id;
      const { 
        full_name, 
        age, 
        bio, 
        hobbies, 
        location, 
        website, 
        phone 
      } = req.body;

      console.log('📝 CreateCompleteProfile - User:', userId, 'Data:', req.body);

      // Procesar foto de perfil si se subió
      let profilePictureUrl = null;
      if (req.files && req.files.length > 0) {
        const imageFile = req.files[0];
        profilePictureUrl = `http://54.146.237.63:3002/uploads/publications/${imageFile.filename}`;
        console.log('✅ Foto de perfil guardada:', profilePictureUrl);
      }

      // Parsear hobbies si viene como string
      let parsedHobbies = [];
      if (hobbies) {
        try {
          parsedHobbies = Array.isArray(hobbies) ? hobbies : JSON.parse(hobbies);
        } catch (e) {
          console.log('⚠️ Error parseando hobbies, usando array vacío');
        }
      }

      // Verificar si ya existe un perfil completo
      const existingProfile = await CompleteProfileModel.findOne({
        where: { user_id: userId }
      });

      if (existingProfile) {
        return res.status(400).json({
          success: false,
          message: 'Ya tienes un perfil completo configurado. Use PUT para actualizar.'
        });
      }

      // Crear nuevo perfil completo
      const completeProfile = await CompleteProfileModel.create({
        id: uuidv4(),
        user_id: userId,
        full_name: fullName,
        age: age ? parseInt(age) : null,
        profile_picture: profilePictureUrl,
        bio: bio || null,
        hobbies: parsedHobbies,
        location: location || null,
        website: website || null,
        phone: phone || null
      });

      console.log('✅ Perfil completo creado exitosamente:', userId);

      // Obtener el perfil completo con relaciones
      const createdProfile = await CompleteProfileModel.findByPk(completeProfile.id, {
        include: [
          {
            model: UserProfileModel,
            as: 'user',
            attributes: ['user_id', 'display_name', 'avatar_url']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Perfil completo creado exitosamente',
        data: createdProfile
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Actualizar perfil completo de un usuario
   */
  async updateCompleteProfile(req, res) {
    try {
      const userId = req.user.id;
      const { 
        full_name, 
        age, 
        bio, 
        hobbies, 
        location, 
        website, 
        phone 
      } = req.body;

      console.log('✏️ UpdateCompleteProfile - User:', userId, 'Data:', req.body);

      // Buscar perfil existente
      let completeProfile = await CompleteProfileModel.findOne({
        where: { user_id: userId }
      });

      // Procesar nueva foto de perfil si se subió
      let profilePictureUrl = completeProfile?.profile_picture || null;
      if (req.files && req.files.length > 0) {
        const imageFile = req.files[0];
        profilePictureUrl = `http://54.146.237.63:3002/uploads/publications/${imageFile.filename}`;
        console.log('✅ Nueva foto de perfil guardada:', profilePictureUrl);
      }

      // Parsear hobbies si viene como string
      let parsedHobbies = completeProfile?.hobbies || [];
      if (hobbies !== undefined) {
        try {
          parsedHobbies = Array.isArray(hobbies) ? hobbies : JSON.parse(hobbies);
        } catch (e) {
          console.log('⚠️ Error parseando hobbies, manteniendo hobbies actuales');
        }
      }

      if (!completeProfile) {
        // Si no existe, crear nuevo perfil
        completeProfile = await CompleteProfileModel.create({
          id: uuidv4(),
          user_id: userId,
          full_name: full_name || null,
          age: age ? parseInt(age) : null,
          profile_picture: profilePictureUrl,
          bio: bio || null,
          hobbies: parsedHobbies,
          location: location || null,
          website: website || null,
          phone: phone || null
        });

        console.log('✅ Perfil completo creado (no existía previamente):', userId);

        // Obtener el perfil completo con relaciones
        const createdProfile = await CompleteProfileModel.findByPk(completeProfile.id, {
          include: [
            {
              model: UserProfileModel,
              as: 'user',
            attributes: ['user_id', 'display_name', 'avatar_url']
            }
          ]
        });

        return res.status(201).json({
          success: true,
          message: 'Perfil completo creado exitosamente',
          data: createdProfile
        });
      }

      // Actualizar perfil existente
      await completeProfile.update({
        full_name: full_name !== undefined ? full_name : completeProfile.full_name,
        age: age !== undefined ? (age ? parseInt(age) : null) : completeProfile.age,
        profile_picture: profilePictureUrl,
        bio: bio !== undefined ? bio : completeProfile.bio,
        hobbies: parsedHobbies,
        location: location !== undefined ? location : completeProfile.location,
        website: website !== undefined ? website : completeProfile.website,
        phone: phone !== undefined ? phone : completeProfile.phone
      });

      console.log('✅ Perfil completo actualizado exitosamente:', userId);

      // Obtener el perfil actualizado con relaciones
      const updatedProfile = await CompleteProfileModel.findByPk(completeProfile.id, {
        include: [
          {
            model: UserProfileModel,
            as: 'user',
            attributes: ['user_id', 'display_name', 'avatar_url']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Perfil completo actualizado exitosamente',
        data: updatedProfile
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Eliminar perfil completo de un usuario
   */
  async deleteCompleteProfile(req, res) {
    try {
      const userId = req.user.id;

      console.log('🗑️ DeleteCompleteProfile - User:', userId);

      const completeProfile = await CompleteProfileModel.findOne({
        where: { user_id: userId }
      });

      if (!completeProfile) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró perfil completo para eliminar'
        });
      }

      // Eliminar perfil completo
      await completeProfile.destroy();

      console.log('✅ Perfil completo eliminado exitosamente:', userId);

      res.status(200).json({
        success: true,
        message: 'Perfil completo eliminado exitosamente'
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  _handleError(res, error) {
    console.error('Error en CompleteProfileController:', error.message);
    
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
        message: 'Ya existe un perfil completo para este usuario'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = CompleteProfileController;