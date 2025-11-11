const IUserProfileRepository = require('../../domain/repositories/IUserProfileRepository');
const UserProfile = require('../../domain/aggregates/UserProfile/UserProfile');
const Interest = require('../../domain/aggregates/UserProfile/entities/Interest');
const { UserProfileModel, InterestModel } = require('../database/models');
const { Op } = require('sequelize');

/**
 * Implementación del repositorio de UserProfile usando Sequelize
 */
class SequelizeUserProfileRepository extends IUserProfileRepository {
  
  /**
   * Buscar un perfil por ID
   */
  async findById(userId) {
    try {
      const profileData = await UserProfileModel.findByPk(userId);
      return profileData;
    } catch (error) {
      throw new Error(`Error al buscar perfil por ID: ${error.message}`);
    }
  }

  /**
   * Buscar un perfil por user_id
   */
  async findByUserId(userId) {
    try {
      const profileData = await UserProfileModel.findOne({
        where: { user_id: userId }
      });
      return profileData;
    } catch (error) {
      throw new Error(`Error al buscar perfil por user_id: ${error.message}`);
    }
  }

  /**
   * Crear un nuevo perfil (método simple)
   */
  async create(profileData) {
    try {
      const newProfile = await UserProfileModel.create(profileData);
      return newProfile;
    } catch (error) {
      throw new Error(`Error al crear perfil: ${error.message}`);
    }
  }

  /**
   * Actualizar un perfil existente (método simple)
   */
  async update(profileId, updateData) {
    try {
      const [updatedRowsCount] = await UserProfileModel.update(updateData, {
        where: { id: profileId }
      });
      
      if (updatedRowsCount === 0) {
        throw new Error('Perfil no encontrado para actualizar');
      }
      
      return await UserProfileModel.findByPk(profileId);
    } catch (error) {
      throw new Error(`Error al actualizar perfil: ${error.message}`);
    }
  }

  /**
   * Buscar un perfil por username
   */
  async findByUsername(username) {
    try {
      const profileData = await UserProfileModel.findOne({
        where: { username },
        include: [
          {
            model: InterestModel,
            as: 'interests'
          }
        ]
      });

      if (!profileData) {
        return null;
      }

      return this._mapToAggregate(profileData);
    } catch (error) {
      throw new Error(`Error al buscar perfil por username: ${error.message}`);
    }
  }

  /**
   * Guardar un perfil (crear o actualizar)
   */
  async save(userProfile) {
    const transaction = await UserProfileModel.sequelize.transaction();
    
    try {
      // Buscar si ya existe
      const existingProfile = await UserProfileModel.findByPk(
        userProfile.id.value, 
        { transaction }
      );

      let profileData;
      
      if (existingProfile) {
        // Actualizar perfil existente
        await existingProfile.update({
          username: userProfile.username,
          bio: userProfile.bio ? userProfile.bio.value : null,
          friends: JSON.stringify(userProfile.friends),
          blocked_users: JSON.stringify(userProfile.blockedUsers),
          updated_at: userProfile.updatedAt
        }, { transaction });
        
        profileData = existingProfile;
      } else {
        // Crear nuevo perfil
        profileData = await UserProfileModel.create({
          id: userProfile.id.value,
          username: userProfile.username,
          bio: userProfile.bio ? userProfile.bio.value : null,
          friends: JSON.stringify(userProfile.friends),
          blocked_users: JSON.stringify(userProfile.blockedUsers),
          created_at: userProfile.createdAt,
          updated_at: userProfile.updatedAt
        }, { transaction });
      }

      // Guardar intereses
      await this._saveInterests(userProfile, transaction);

      await transaction.commit();
      
      // Recargar con relaciones
      const savedProfile = await this.findById(userProfile.id.value);
      return savedProfile;
      
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al guardar perfil: ${error.message}`);
    }
  }

  /**
   * Eliminar un perfil
   */
  async delete(userId) {
    try {
      const profile = await UserProfileModel.findByPk(userId);
      if (!profile) {
        throw new Error('Perfil no encontrado');
      }
      
      await profile.destroy();
    } catch (error) {
      throw new Error(`Error al eliminar perfil: ${error.message}`);
    }
  }

  /**
   * Verificar si existe un perfil
   */
  async exists(userId) {
    try {
      const count = await UserProfileModel.count({
        where: { id: userId }
      });
      return count > 0;
    } catch (error) {
      throw new Error(`Error al verificar existencia: ${error.message}`);
    }
  }

  /**
   * Verificar si un username está disponible
   */
  async isUsernameAvailable(username, excludeUserId = null) {
    try {
      const whereClause = { username };
      
      if (excludeUserId) {
        whereClause.id = { [Op.ne]: excludeUserId };
      }
      
      const count = await UserProfileModel.count({
        where: whereClause
      });
      
      return count === 0;
    } catch (error) {
      throw new Error(`Error al verificar username: ${error.message}`);
    }
  }

  /**
   * Obtener los amigos de un usuario
   */
  async getFriends(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;
      
      const userProfile = await UserProfileModel.findByPk(userId);
      if (!userProfile) {
        return { friends: [], total: 0 };
      }
      
      const friendIds = JSON.parse(userProfile.friends || '[]');
      
      if (friendIds.length === 0) {
        return { friends: [], total: 0 };
      }
      
      const { count, rows } = await UserProfileModel.findAndCountAll({
        where: { id: { [Op.in]: friendIds } },
        include: [
          {
            model: InterestModel,
            as: 'interests'
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      const friends = rows.map(profileData => this._mapToAggregate(profileData));
      
      return {
        friends,
        total: count
      };
    } catch (error) {
      throw new Error(`Error al obtener amigos: ${error.message}`);
    }
  }

  /**
   * Obtener usuarios bloqueados
   */
  async getBlockedUsers(userId) {
    try {
      const userProfile = await UserProfileModel.findByPk(userId);
      if (!userProfile) {
        return [];
      }
      
      const blockedIds = JSON.parse(userProfile.blocked_users || '[]');
      
      if (blockedIds.length === 0) {
        return [];
      }
      
      const blockedProfiles = await UserProfileModel.findAll({
        where: { id: { [Op.in]: blockedIds } },
        include: [
          {
            model: InterestModel,
            as: 'interests'
          }
        ]
      });
      
      return blockedProfiles.map(profileData => this._mapToAggregate(profileData));
    } catch (error) {
      throw new Error(`Error al obtener usuarios bloqueados: ${error.message}`);
    }
  }

  /**
   * Buscar perfiles por criterios
   */
  async findByCriteria(criteria, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      
      if (criteria.username) {
        whereClause.username = { [Op.like]: `%${criteria.username}%` };
      }
      
      if (criteria.status) {
        whereClause.status = criteria.status;
      }
      
      const { count, rows } = await UserProfileModel.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: InterestModel,
            as: 'interests'
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });
      
      const profiles = rows.map(profileData => this._mapToAggregate(profileData));
      
      return {
        profiles,
        total: count
      };
    } catch (error) {
      throw new Error(`Error en búsqueda por criterios: ${error.message}`);
    }
  }

  /**
   * Obtener sugerencias de amigos
   */
  async getFriendSuggestions(userId, limit = 10) {
    try {
      const userProfile = await UserProfileModel.findByPk(userId);
      if (!userProfile) {
        return [];
      }
      
      const friendIds = JSON.parse(userProfile.friends || '[]');
      const blockedIds = JSON.parse(userProfile.blocked_users || '[]');
      const excludeIds = [userId, ...friendIds, ...blockedIds];
      
      const suggestions = await UserProfileModel.findAll({
        where: { 
          id: { [Op.notIn]: excludeIds },
          status: 'active'
        },
        include: [
          {
            model: InterestModel,
            as: 'interests'
          }
        ],
        limit: parseInt(limit),
        order: [['created_at', 'DESC']]
      });
      
      return suggestions.map(profileData => this._mapToAggregate(profileData));
    } catch (error) {
      throw new Error(`Error al obtener sugerencias: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas del perfil
   */
  async getProfileStats(userId) {
    try {
      const userProfile = await UserProfileModel.findByPk(userId);
      if (!userProfile) {
        return null;
      }
      
      const friendIds = JSON.parse(userProfile.friends || '[]');
      const blockedIds = JSON.parse(userProfile.blocked_users || '[]');
      
      const interestsCount = await InterestModel.count({
        where: { user_id: userId }
      });
      
      return {
        friendsCount: friendIds.length,
        blockedUsersCount: blockedIds.length,
        interestsCount,
        profileCreatedAt: userProfile.created_at,
        lastUpdatedAt: userProfile.updated_at
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  // Métodos auxiliares privados

  /**
   * Mapear de modelo Sequelize a agregado del dominio
   */
  _mapToAggregate(profileData) {
    // Crear el agregado UserProfile
    const userProfile = new UserProfile(
      profileData.id,
      profileData.username,
      profileData.bio
    );

    // Restaurar estado del agregado
    userProfile._createdAt = profileData.created_at;
    userProfile._updatedAt = profileData.updated_at;

    // Restaurar amigos
    const friendIds = JSON.parse(profileData.friends || '[]');
    friendIds.forEach(friendId => {
      userProfile._friends.add(friendId);
    });

    // Restaurar usuarios bloqueados
    const blockedIds = JSON.parse(profileData.blocked_users || '[]');
    blockedIds.forEach(blockedId => {
      userProfile._blockedUsers.add(blockedId);
    });

    // Mapear intereses
    if (profileData.interests) {
      profileData.interests.forEach(interestData => {
        const interest = new Interest(
          interestData.id,
          interestData.name,
          interestData.user_id
        );
        
        // Restaurar fecha de creación
        interest._createdAt = interestData.created_at;
        
        userProfile._interests.set(interest.id, interest);
      });
    }

    return userProfile;
  }

  /**
   * Guardar intereses del agregado
   */
  async _saveInterests(userProfile, transaction) {
    // Eliminar intereses existentes
    await InterestModel.destroy({
      where: { user_id: userProfile.id.value },
      transaction
    });

    // Crear intereses del agregado
    for (const interest of userProfile.interests) {
      await InterestModel.create({
        id: interest.id,
        user_id: userProfile.id.value,
        name: interest.name,
        created_at: interest.createdAt
      }, { transaction });
    }
  }
}

module.exports = SequelizeUserProfileRepository;