const { Sequelize } = require('sequelize');
const { getDatabaseConfig } = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = getDatabaseConfig(env);

const sequelize = new Sequelize(dbConfig);

// Importar modelos
const UserProfileModel = require('./UserProfileModel')(sequelize, Sequelize.DataTypes);
const InterestModel = require('./InterestModel')(sequelize, Sequelize.DataTypes);
const PublicationModel = require('./PublicationModel')(sequelize, Sequelize.DataTypes);
const CommentModel = require('./CommentModel')(sequelize, Sequelize.DataTypes);
const LikeModel = require('./LikeModel')(sequelize, Sequelize.DataTypes);
const MediaItemModel = require('./MediaItemModel')(sequelize, Sequelize.DataTypes);

// Definir asociaciones entre modelos

// UserProfile - Interest (1:N)
UserProfileModel.hasMany(InterestModel, { 
  foreignKey: 'user_id', 
  as: 'interests',
  onDelete: 'CASCADE'
});
InterestModel.belongsTo(UserProfileModel, { 
  foreignKey: 'user_id', 
  as: 'userProfile'
});

// UserProfile - Publication (1:N)
UserProfileModel.hasMany(PublicationModel, { 
  foreignKey: 'user_id', 
  as: 'publications',
  onDelete: 'CASCADE'
});
PublicationModel.belongsTo(UserProfileModel, { 
  foreignKey: 'user_id', 
  as: 'author'
});

// Publication - Comment (1:N)
PublicationModel.hasMany(CommentModel, { 
  foreignKey: 'post_id', 
  as: 'comments',
  onDelete: 'CASCADE'
});
CommentModel.belongsTo(PublicationModel, { 
  foreignKey: 'post_id', 
  as: 'publication'
});

// Comment - Comment (1:N) - Para respuestas a comentarios
CommentModel.hasMany(CommentModel, { 
  foreignKey: 'parent_id', 
  as: 'replies',
  onDelete: 'CASCADE'
});
CommentModel.belongsTo(CommentModel, { 
  foreignKey: 'parent_id', 
  as: 'parentComment'
});

// UserProfile - Comment (1:N)
UserProfileModel.hasMany(CommentModel, { 
  foreignKey: 'user_id', 
  as: 'comments',
  onDelete: 'CASCADE'
});
CommentModel.belongsTo(UserProfileModel, { 
  foreignKey: 'user_id', 
  as: 'author'
});

// Publication - MediaItem (1:N)
PublicationModel.hasMany(MediaItemModel, { 
  foreignKey: 'post_id', 
  as: 'mediaItems',
  onDelete: 'CASCADE'
});
MediaItemModel.belongsTo(PublicationModel, { 
  foreignKey: 'post_id', 
  as: 'publication'
});

// Publication - Like (1:N) usando el sistema polymórfico
PublicationModel.hasMany(LikeModel, {
  foreignKey: 'likeable_id',
  constraints: false,
  scope: {
    likeable_type: 'post'
  },
  as: 'likes'
});

// Comment - Like (1:N) usando el sistema polymórfico  
CommentModel.hasMany(LikeModel, {
  foreignKey: 'likeable_id', 
  constraints: false,
  scope: {
    likeable_type: 'comment'
  },
  as: 'likes'
});

// UserProfile - Like (1:N)
UserProfileModel.hasMany(LikeModel, { 
  foreignKey: 'user_id', 
  as: 'likes',
  onDelete: 'CASCADE'
});
LikeModel.belongsTo(UserProfileModel, { 
  foreignKey: 'user_id', 
  as: 'user'
});

// Exportar todo
const db = {
  sequelize,
  Sequelize,
  UserProfileModel,
  InterestModel,
  PublicationModel,
  CommentModel,
  LikeModel,
  MediaItemModel
};

module.exports = db;