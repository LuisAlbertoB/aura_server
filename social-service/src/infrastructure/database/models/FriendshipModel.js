const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Friendship = sequelize.define('Friendship', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    requester_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'ID del usuario que envía la solicitud'
    },
    addressee_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'ID del usuario que recibe la solicitud'
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'),
      defaultValue: 'pending',
      comment: 'Estado de la amistad'
    }
  }, {
    tableName: 'friendships',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['requester_id'] },
      { fields: ['addressee_id'] },
      { fields: ['status'] },
      { 
        fields: ['requester_id', 'addressee_id'], 
        unique: true,
        name: 'unique_friendship'
      }
    ],
    validate: {
      // Validar que no se pueda enviar solicitud a sí mismo
      notSelfFriendship() {
        if (this.requester_id === this.addressee_id) {
          throw new Error('No puedes enviar una solicitud de amistad a ti mismo');
        }
      }
    }
  });

  // Define associations
  Friendship.associate = (models) => {
    // Una amistad pertenece a un solicitante
    Friendship.belongsTo(models.UserProfile, {
      foreignKey: 'requester_id',
      as: 'requester'
    });

    // Una amistad pertenece a un destinatario
    Friendship.belongsTo(models.UserProfile, {
      foreignKey: 'addressee_id',
      as: 'addressee'
    });
  };

  return Friendship;
};