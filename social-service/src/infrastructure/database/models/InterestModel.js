// Modelo para los intereses del usuario
module.exports = (sequelize, DataTypes) => {
  const InterestModel = sequelize.define('Interest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'ID del usuario propietario del interés'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre del interés'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Categoría del interés (deportes, música, etc.)'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'interests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['name']
      },
      {
        fields: ['category']
      },
      {
        unique: true,
        fields: ['user_id', 'name']
      }
    ]
  });

  return InterestModel;
};