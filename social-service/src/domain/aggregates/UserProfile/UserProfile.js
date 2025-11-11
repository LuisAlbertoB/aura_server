const UserId = require('./valueObjects/UserId');
const Bio = require('./valueObjects/Bio');
const Interest = require('./entities/Interest');
const { v4: uuidv4 } = require('uuid');


class UserProfile {
  constructor(id, username, bio = null) {
    this._id = new UserId(id);
    this._username = username;
    this._bio = bio ? new Bio(bio) : null;
    this._interests = new Map(); // Map<string, Interest>
    this._friends = new Set(); // Set<string> - IDs de amigos
    this._blockedUsers = new Set(); // Set<string> - IDs de usuarios bloqueados
    this._createdAt = new Date();
    this._updatedAt = new Date();

    this.validateUsername(username);
  }

  validateUsername(username) {
    if (!username || typeof username !== 'string') {
      throw new Error('Username es requerido');
    }
    if (username.length < 3 || username.length > 30) {
      throw new Error('Username debe tener entre 3 y 30 caracteres');
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      throw new Error('Username solo puede contener letras, números, puntos, guiones y guiones bajos');
    }
  }

  // Getters
  get id() { return this._id; }
  get username() { return this._username; }
  get bio() { return this._bio; }
  get interests() { return Array.from(this._interests.values()); }
  get friends() { return Array.from(this._friends); }
  get blockedUsers() { return Array.from(this._blockedUsers); }
  get createdAt() { return this._createdAt; }
  get updatedAt() { return this._updatedAt; }

  // Métodos de negocio del diagrama

  /**
   * Actualizar perfil - updateProfile(username, bio)
   */
  updateProfile(newUsername, newBio) {
    if (newUsername && newUsername !== this._username) {
      this.validateUsername(newUsername);
      this._username = newUsername;
    }

    if (newBio !== undefined) {
      this._bio = newBio ? new Bio(newBio) : null;
    }

    this._updatedAt = new Date();
  }

  /**
   * Agregar amigo - addFriend(friendId)
   */
  addFriend(friendId) {
    if (!friendId || typeof friendId !== 'string') {
      throw new Error('FriendId debe ser válido');
    }
    
    // No se puede agregar a sí mismo
    if (friendId === this._id.value) {
      throw new Error('No puedes agregarte a ti mismo como amigo');
    }

    // No se puede agregar a usuario bloqueado
    if (this._blockedUsers.has(friendId)) {
      throw new Error('No puedes agregar como amigo a un usuario bloqueado');
    }

    // Verificar si ya es amigo
    if (this._friends.has(friendId)) {
      throw new Error('El usuario ya está en tu lista de amigos');
    }

    this._friends.add(friendId);
    this._updatedAt = new Date();
    
    return {
      type: 'FRIEND_ADDED',
      userId: this._id.value,
      friendId,
      timestamp: this._updatedAt
    };
  }

  /**
   * Remover amigo
   */
  removeFriend(friendId) {
    if (!this._friends.has(friendId)) {
      throw new Error('El usuario no está en tu lista de amigos');
    }

    this._friends.delete(friendId);
    this._updatedAt = new Date();
    
    return {
      type: 'FRIEND_REMOVED',
      userId: this._id.value,
      friendId,
      timestamp: this._updatedAt
    };
  }

  /**
   * Bloquear usuario - blockUser(userId)
   */
  blockUser(userIdToBlock) {
    if (!userIdToBlock || typeof userIdToBlock !== 'string') {
      throw new Error('UserId a bloquear debe ser válido');
    }

    // No se puede bloquear a sí mismo
    if (userIdToBlock === this._id.value) {
      throw new Error('No puedes bloquearte a ti mismo');
    }

    // Si es amigo, removerlo primero
    if (this._friends.has(userIdToBlock)) {
      this._friends.delete(userIdToBlock);
    }

    // Verificar si ya está bloqueado
    if (this._blockedUsers.has(userIdToBlock)) {
      throw new Error('El usuario ya está bloqueado');
    }

    this._blockedUsers.add(userIdToBlock);
    this._updatedAt = new Date();
    
    return {
      type: 'USER_BLOCKED',
      userId: this._id.value,
      blockedUserId: userIdToBlock,
      timestamp: this._updatedAt
    };
  }

  /**
   * Desbloquear usuario
   */
  unblockUser(userIdToUnblock) {
    if (!this._blockedUsers.has(userIdToUnblock)) {
      throw new Error('El usuario no está bloqueado');
    }

    this._blockedUsers.delete(userIdToUnblock);
    this._updatedAt = new Date();
    
    return {
      type: 'USER_UNBLOCKED',
      userId: this._id.value,
      unblockedUserId: userIdToUnblock,
      timestamp: this._updatedAt
    };
  }

  /**
   * Actualizar intereses - updateInterests(newInterests)
   */
  updateInterests(newInterests) {
    if (!Array.isArray(newInterests)) {
      throw new Error('Los intereses deben ser un array');
    }

    if (newInterests.length > 20) {
      throw new Error('No puedes tener más de 20 intereses');
    }

    // Limpiar intereses existentes
    this._interests.clear();

    // Agregar nuevos intereses
    newInterests.forEach((interestName, index) => {
      if (typeof interestName !== 'string' || interestName.trim().length === 0) {
        throw new Error('Cada interés debe ser un texto válido');
      }

      const interest = new Interest(
        uuidv4(),
        interestName.trim(),
        this._id.value
      );
      
      this._interests.set(interest.id, interest);
    });

    this._updatedAt = new Date();
  }

  /**
   * Verificaciones de estado
   */
  isFriend(userId) {
    return this._friends.has(userId);
  }

  isBlocked(userId) {
    return this._blockedUsers.has(userId);
  }

  getFriendsCount() {
    return this._friends.size;
  }

  getInterestsCount() {
    return this._interests.size;
  }

  /**
   * Serialización
   */
  toJSON() {
    return {
      id: this._id.value,
      username: this._username,
      bio: this._bio ? this._bio.value : null,
      interests: this.interests.map(interest => interest.toJSON()),
      friendsCount: this.getFriendsCount(),
      interestsCount: this.getInterestsCount(),
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
}

module.exports = UserProfile;