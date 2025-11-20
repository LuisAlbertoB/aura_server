// controllers/AvailableUsersController.js

const { FriendshipModel, UserProfileModel } = require('../../infrastructure/database/models');
const { Op } = require('sequelize');
const axios = require('axios');

class AvailableUsersController {
  constructor() {
    this.getAvailableUsers = this.getAvailableUsers.bind(this);
  }

  /**
   * 📋 Obtiene usuarios disponibles (NO amigos del usuario actual)
   * 
   * Endpoint: GET /api/v1/users/available
   * Query params:
   *   - page: número de página (default: 1)
   *   - limit: elementos por página (default: 20)
   *   - q: búsqueda por nombre/email (opcional)
   *   - excludeUserId: ID del usuario a excluir (opcional, se usa el token si no se proporciona)
   */
  async getAvailableUsers(req, res) {
    try {
      const currentUserId = req.user.id; // Del token JWT
      const { page = 1, limit = 20, q = '' } = req.query;
      const offset = (page - 1) * limit;

      console.log('📋 GetAvailableUsers - CurrentUser:', currentUserId);
      console.log('   Query:', { page, limit, search: q });

      // 1. Obtener IDs de usuarios que NO deben mostrarse
      const excludedUserIds = await this._getExcludedUserIds(currentUserId);
      
      console.log('   🚫 Usuarios excluidos:', excludedUserIds.length);
      console.log('   IDs excluidos:', excludedUserIds);

      // 2. Obtener todos los usuarios del Auth Service
      const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
      const authResponse = await axios.get(`${AUTH_SERVICE_URL}/api/auth/users/public`, {
        headers: {
          'Authorization': req.headers.authorization
        }
      });

      if (!authResponse.data.success) {
        throw new Error('Error obteniendo usuarios del servicio de autenticación');
      }

      let allUsers = authResponse.data.users || [];
      console.log('   👥 Total usuarios del Auth Service:', allUsers.length);

      // 3. Filtrar usuarios excluidos
      let availableUsers = allUsers.filter(user => 
        !excludedUserIds.includes(user.id)
      );

      console.log('   ✅ Usuarios disponibles (después de filtrar):', availableUsers.length);

      // 4. Aplicar búsqueda si existe
      if (q && q.trim()) {
        const searchLower = q.toLowerCase().trim();
        availableUsers = availableUsers.filter(user => {
          const username = (user.username || '').toLowerCase();
          const email = (user.email || '').toLowerCase();
          const role = (user.role || '').toLowerCase();
          
          return username.includes(searchLower) || 
                 email.includes(searchLower) || 
                 role.includes(searchLower);
        });
        console.log('   🔍 Después de búsqueda:', availableUsers.length);
      }

      // 5. Enriquecer con perfiles del Social Service
      const enrichedUsers = await this._enrichWithProfiles(availableUsers);

      // 6. Aplicar paginación
      const totalCount = enrichedUsers.length;
      const paginatedUsers = enrichedUsers.slice(
        parseInt(offset), 
        parseInt(offset) + parseInt(limit)
      );

      console.log('   📄 Paginación: mostrando', paginatedUsers.length, 'de', totalCount);

      // 7. Retornar respuesta
      res.status(200).json({
        success: true,
        message: 'Usuarios disponibles obtenidos exitosamente',
        users: paginatedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        },
        meta: {
          excluded_users_count: excludedUserIds.length,
          search_query: q || null
        }
      });

    } catch (error) {
      this._handleError(res, error);
    }
  }

  /**
   * 🚫 Obtiene IDs de usuarios que deben ser excluidos
   * (usuario actual, amigos, solicitudes pendientes, bloqueados)
   */
  async _getExcludedUserIds(currentUserId) {
    try {
      const excludedIds = new Set();
      
      // 1. Excluir al usuario actual
      excludedIds.add(currentUserId);

      // 2. Obtener todas las relaciones del usuario
      const friendships = await FriendshipModel.findAll({
        where: {
          [Op.or]: [
            { requester_id: currentUserId },
            { addressee_id: currentUserId }
          ],
          is_active: true
        }
      });

      console.log('   📊 Relaciones encontradas:', friendships.length);

      // 3. Procesar cada relación
      for (const friendship of friendships) {
        const otherUserId = friendship.requester_id === currentUserId
          ? friendship.addressee_id
          : friendship.requester_id;

        // Excluir según el estado
        switch (friendship.status) {
          case 'accepted':
            // Son amigos - EXCLUIR
            excludedIds.add(otherUserId);
            console.log('   ✅ Amigo excluido:', otherUserId);
            break;
          
          case 'pending':
            // Solicitud pendiente - EXCLUIR
            excludedIds.add(otherUserId);
            console.log('   ⏳ Solicitud pendiente excluida:', otherUserId);
            break;
          
          case 'blocked':
            // Usuario bloqueado - EXCLUIR
            excludedIds.add(otherUserId);
            console.log('   🚫 Bloqueado excluido:', otherUserId);
            break;
          
          case 'rejected':
            // Solicitud rechazada - NO excluir (pueden reintentar después de 30 días)
            break;
        }
      }

      return Array.from(excludedIds);
    } catch (error) {
      console.error('❌ Error obteniendo usuarios excluidos:', error);
      // En caso de error, al menos excluir el usuario actual
      return [currentUserId];
    }
  }

  /**
   * ✨ Enriquece usuarios con datos de perfil del Social Service
   */
  async _enrichWithProfiles(users) {
    try {
      const enrichedUsers = [];

      for (const user of users) {
        try {
          // Buscar perfil en el Social Service
          const profile = await UserProfileModel.findOne({
            where: { user_id: user.id },
            attributes: ['id', 'user_id', 'display_name', 'bio', 'avatar_url', 
                        'location', 'website', 'birth_date']
          });

          if (profile) {
            // Usuario con perfil
            enrichedUsers.push({
              ...user,
              profile: {
                id: profile.id,
                display_name: profile.display_name,
                bio: profile.bio,
                avatar_url: profile.avatar_url,
                location: profile.location,
                website: profile.website,
                birth_date: profile.birth_date
              }
            });
          } else {
            // Usuario sin perfil
            enrichedUsers.push({
              ...user,
              profile: null
            });
          }
        } catch (profileError) {
          console.error(`⚠️ Error obteniendo perfil de ${user.id}:`, profileError.message);
          // Incluir usuario sin perfil
          enrichedUsers.push({
            ...user,
            profile: null
          });
        }
      }

      return enrichedUsers;
    } catch (error) {
      console.error('❌ Error enriqueciendo perfiles:', error);
      // Si falla, devolver usuarios sin enriquecer
      return users.map(user => ({ ...user, profile: null }));
    }
  }

  _handleError(res, error) {
    console.error('❌ Error en AvailableUsersController:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Servicio de autenticación no disponible',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = AvailableUsersController;