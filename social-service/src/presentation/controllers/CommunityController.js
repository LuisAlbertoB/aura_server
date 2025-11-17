// presentation/controllers/CommunityController.js (Puerto 3002)
const { CommunityModel, CommunityMemberModel, UserProfileModel } = require('../../infrastructure/database/models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

class CommunityController {
  constructor() {
    this.getAllCommunities = this.getAllCommunities.bind(this);
    this.getCommunityById = this.getCommunityById.bind(this);
    this.createCommunity = this.createCommunity.bind(this);
    this.updateCommunity = this.updateCommunity.bind(this);
    this.deleteCommunity = this.deleteCommunity.bind(this);
    this.joinCommunity = this.joinCommunity.bind(this);
    this.leaveCommunity = this.leaveCommunity.bind(this);
    this.getCommunityMembers = this.getCommunityMembers.bind(this);
    this.getUserCommunities = this.getUserCommunities.bind(this);
    this.searchCommunities = this.searchCommunities.bind(this);
  }

  async getAllCommunities(req, res) {
    try {
      console.log('📋 GetAllCommunities - query params:', req.query);

      const {
        page = 1,
        limit = 10,
        category,
        tags,
        search
      } = req.query;

      const offset = (page - 1) * limit;

      let where = { is_active: true };

      if (category) {
        where.category = category;
      }

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        where.tags = { [Op.overlap]: tagArray };
      }

      console.log('🔍 Community filters:', where);

      const { count, rows } = await CommunityModel.findAndCountAll({
        where,
        include: [
          {
            model: UserProfileModel,
            as: 'creator',
            attributes: ['user_id', 'display_name', 'username']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      res.status(200).json({
        success: true,
        message: 'Comunidades obtenidas exitosamente',
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  async getCommunityById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      console.log('🔍 GetCommunityById - ID:', id);

      const community = await CommunityModel.findByPk(id, {
        include: [
          {
            model: UserProfileModel,
            as: 'creator',
            attributes: ['user_id', 'display_name', 'username']
          },
          {
            model: CommunityMemberModel,
            as: 'memberships',
            include: [
              {
                model: UserProfileModel,
                as: 'user',
                attributes: ['user_id', 'display_name', 'username']
              }
            ]
          }
        ]
      });

      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Comunidad no encontrada'
        });
      }

      let userMembership = null;
      if (userId) {
        userMembership = await CommunityMemberModel.findOne({
          where: { community_id: id, user_id: userId }
        });
      }

      const communityData = community.toJSON();
      communityData.userMembership = userMembership;
      communityData.isMember = !!userMembership;

      res.status(200).json({
        success: true,
        message: 'Comunidad obtenida exitosamente',
        data: communityData
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  async createCommunity(req, res) {
    try {
      console.log('📝 CreateCommunity - req.body:', req.body);
      console.log('📤 CreateCommunity - req.file:', req.file);
      console.log('👤 CreateCommunity - req.user:', req.user);

      const { name, description, category, tags } = req.body;
      const creatorId = req.user.id;

      // Validar campos requeridos
      if (!name || !category) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y categoría son requeridos'
        });
      }

      // ✅ Procesar imagen de Cloudinary
      let communityImageUrl = null;
      if (req.file) {
        // Cloudinary devuelve la URL en req.file.path
        communityImageUrl = req.file.path;
        console.log('✅ Imagen de comunidad guardada en Cloudinary:', communityImageUrl);
      }

      // Parsear tags si viene como string
      let parsedTags = [];
      if (tags) {
        try {
          parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
        } catch (e) {
          console.log('⚠️ Error parseando tags, usando array vacío');
        }
      }

      // Crear la comunidad
      const communityData = {
        id: uuidv4(),
        creator_id: creatorId,
        name,
        description: description || null,
        category,
        tags: parsedTags,
        community_image_url: communityImageUrl,
        members_count: 1,
        is_active: true
      };

      console.log('📝 Datos de comunidad a crear:', communityData);

      const community = await CommunityModel.create(communityData);

      // Agregar al creador como miembro con rol 'creator'
      await CommunityMemberModel.create({
        id: uuidv4(),
        community_id: community.id,
        user_id: creatorId,
        role: 'creator',
        joined_at: new Date()
      });

      console.log('✅ Comunidad creada exitosamente:', community.id);

      // Obtener la comunidad completa con relaciones
      const createdCommunity = await CommunityModel.findByPk(community.id, {
        include: [
          {
            model: UserProfileModel,
            as: 'creator',
            attributes: ['user_id', 'display_name', 'username']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Comunidad creada exitosamente',
        data: createdCommunity
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  async updateCommunity(req, res) {
    try {
      const { id } = req.params;
      const { name, description, category, tags } = req.body;
      const userId = req.user.id;

      console.log('✏️ UpdateCommunity - ID:', id, 'User:', userId);

      const community = await CommunityModel.findByPk(id);
      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Comunidad no encontrada'
        });
      }

      const membership = await CommunityMemberModel.findOne({
        where: { community_id: id, user_id: userId }
      });

      if (!membership || !['creator', 'admin'].includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para editar esta comunidad'
        });
      }

      // ✅ Procesar nueva imagen de Cloudinary si se subió
      let communityImageUrl = community.community_image_url;
      if (req.file) {
        communityImageUrl = req.file.path;
        console.log('✅ Nueva imagen de comunidad:', communityImageUrl);
      }

      let parsedTags = community.tags;
      if (tags) {
        try {
          parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
        } catch (e) {
          console.log('⚠️ Error parseando tags, manteniendo tags actuales');
        }
      }

      await community.update({
        name: name || community.name,
        description: description !== undefined ? description : community.description,
        category: category || community.category,
        tags: parsedTags,
        community_image_url: communityImageUrl
      });

      console.log('✅ Comunidad actualizada:', id);

      const updatedCommunity = await CommunityModel.findByPk(id, {
        include: [
          {
            model: UserProfileModel,
            as: 'creator',
            attributes: ['user_id', 'display_name', 'username']
          }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Comunidad actualizada exitosamente',
        data: updatedCommunity
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  async deleteCommunity(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      console.log('🗑️ DeleteCommunity - ID:', id, 'User:', userId);

      const community = await CommunityModel.findByPk(id);
      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Comunidad no encontrada'
        });
      }

      if (community.creator_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Solo el creador puede eliminar la comunidad'
        });
      }

      await community.update({ is_active: false });

      res.status(200).json({
        success: true,
        message: 'Comunidad eliminada exitosamente'
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  async joinCommunity(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      console.log('🚪 JoinCommunity - ID:', id, 'User:', userId);

      const community = await CommunityModel.findByPk(id);
      if (!community || !community.is_active) {
        return res.status(404).json({
          success: false,
          message: 'Comunidad no encontrada o inactiva'
        });
      }

      const existingMembership = await CommunityMemberModel.findOne({
        where: { community_id: id, user_id: userId }
      });

      if (existingMembership) {
        return res.status(400).json({
          success: false,
          message: 'Ya eres miembro de esta comunidad'
        });
      }

      await CommunityMemberModel.create({
        id: uuidv4(),
        community_id: id,
        user_id: userId,
        role: 'member',
        joined_at: new Date()
      });

      await community.increment('members_count');

      res.status(200).json({
        success: true,
        message: 'Te has unido a la comunidad exitosamente'
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  async leaveCommunity(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      console.log('🚪 LeaveCommunity - ID:', id, 'User:', userId);

      const community = await CommunityModel.findByPk(id);
      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Comunidad no encontrada'
        });
      }

      if (community.creator_id === userId) {
        return res.status(400).json({
          success: false,
          message: 'El creador no puede salir de su propia comunidad'
        });
      }

      const membership = await CommunityMemberModel.findOne({
        where: { community_id: id, user_id: userId }
      });

      if (!membership) {
        return res.status(400).json({
          success: false,
          message: 'No eres miembro de esta comunidad'
        });
      }

      await membership.destroy();
      await community.decrement('members_count');

      res.status(200).json({
        success: true,
        message: 'Has salido de la comunidad exitosamente'
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  async getCommunityMembers(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      console.log('👥 GetCommunityMembers - ID:', id);

      const { count, rows } = await CommunityMemberModel.findAndCountAll({
        where: { community_id: id },
        include: [
          {
            model: UserProfileModel,
            as: 'user',
            attributes: ['user_id', 'display_name', 'username', 'avatar_url']
          }
        ],
        order: [['joined_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.status(200).json({
        success: true,
        message: 'Miembros obtenidos exitosamente',
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  async getUserCommunities(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      console.log('👤 GetUserCommunities - User:', userId);

      const { count, rows } = await CommunityMemberModel.findAndCountAll({
        where: { user_id: userId },
        include: [
          {
            model: CommunityModel,
            as: 'community',
            where: { is_active: true },
            include: [
              {
                model: UserProfileModel,
                as: 'creator',
                attributes: ['user_id', 'display_name', 'username']
              }
            ]
          }
        ],
        order: [['joined_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.status(200).json({
        success: true,
        message: 'Comunidades del usuario obtenidas exitosamente',
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  async searchCommunities(req, res) {
    try {
      const { q, category, tags } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'La búsqueda debe tener al menos 2 caracteres'
        });
      }

      console.log('🔍 SearchCommunities - Query:', q);

      let where = {
        is_active: true,
        [Op.or]: [
          { name: { [Op.like]: `%${q.trim()}%` } },
          { description: { [Op.like]: `%${q.trim()}%` } }
        ]
      };

      if (category) {
        where.category = category;
      }

      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        where.tags = { [Op.overlap]: tagArray };
      }

      const communities = await CommunityModel.findAll({
        where,
        include: [
          {
            model: UserProfileModel,
            as: 'creator',
            attributes: ['user_id', 'display_name', 'username']
          }
        ],
        order: [['members_count', 'DESC']],
        limit: 20
      });

      res.status(200).json({
        success: true,
        message: 'Búsqueda completada',
        data: communities
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  _handleError(res, error) {
    console.error('Error en CommunityController:', error.message);
    
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
        message: 'Ya existe un recurso con esos datos'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = CommunityController;