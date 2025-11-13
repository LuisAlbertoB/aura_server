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

// Nuevos modelos
const CommunityModel = require('./CommunityModel')(sequelize, Sequelize.DataTypes);
const UserPreferenceModel = require('./UserPreferenceModel')(sequelize, Sequelize.DataTypes);
const CompleteProfileModel = require('./CompleteProfileModel')(sequelize, Sequelize.DataTypes);
const FriendshipModel = require('./FriendshipModel')(sequelize, Sequelize.DataTypes);
const CommunityMemberModel = require('./CommunityMemberModel')(sequelize, Sequelize.DataTypes);

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

// Definir asociaciones para los nuevos modelos

// UserProfile - UserPreference (1:1)
UserProfileModel.hasOne(UserPreferenceModel, { 
  foreignKey: 'user_id', 
  as: 'userPreferences',
  onDelete: 'CASCADE'
});
UserPreferenceModel.belongsTo(UserProfileModel, { 
  foreignKey: 'user_id', 
  as: 'user'
});

// UserProfile - CompleteProfile (1:1)
UserProfileModel.hasOne(CompleteProfileModel, { 
  foreignKey: 'user_id', 
  as: 'completeProfile',
  onDelete: 'CASCADE'
});
CompleteProfileModel.belongsTo(UserProfileModel, { 
  foreignKey: 'user_id', 
  as: 'user'
});

// UserProfile - Community (1:N) - Como creador
UserProfileModel.hasMany(CommunityModel, { 
  foreignKey: 'creator_id', 
  as: 'createdCommunities',
  onDelete: 'CASCADE'
});
CommunityModel.belongsTo(UserProfileModel, { 
  foreignKey: 'creator_id', 
  as: 'creator'
});

// Community - CommunityMember (1:N)
CommunityModel.hasMany(CommunityMemberModel, { 
  foreignKey: 'community_id', 
  as: 'memberships',
  onDelete: 'CASCADE'
});
CommunityMemberModel.belongsTo(CommunityModel, { 
  foreignKey: 'community_id', 
  as: 'community'
});

// UserProfile - CommunityMember (1:N)
UserProfileModel.hasMany(CommunityMemberModel, { 
  foreignKey: 'user_id', 
  as: 'communityMemberships',
  onDelete: 'CASCADE'
});
CommunityMemberModel.belongsTo(UserProfileModel, { 
  foreignKey: 'user_id', 
  as: 'user'
});

// UserProfile - Community (N:M) a través de CommunityMember
UserProfileModel.belongsToMany(CommunityModel, {
  through: CommunityMemberModel,
  foreignKey: 'user_id',
  otherKey: 'community_id',
  as: 'joinedCommunities'
});
CommunityModel.belongsToMany(UserProfileModel, {
  through: CommunityMemberModel,
  foreignKey: 'community_id',
  otherKey: 'user_id',
  as: 'members'
});

// UserProfile - Friendship (1:N) - Como solicitante
UserProfileModel.hasMany(FriendshipModel, { 
  foreignKey: 'requester_id', 
  as: 'sentFriendRequests',
  onDelete: 'CASCADE'
});
FriendshipModel.belongsTo(UserProfileModel, { 
  foreignKey: 'requester_id', 
  as: 'requester'
});

// UserProfile - Friendship (1:N) - Como destinatario
UserProfileModel.hasMany(FriendshipModel, { 
  foreignKey: 'addressee_id', 
  as: 'receivedFriendRequests',
  onDelete: 'CASCADE'
});
FriendshipModel.belongsTo(UserProfileModel, { 
  foreignKey: 'addressee_id', 
  as: 'addressee'
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
  MediaItemModel,
  // Nuevos modelos
  CommunityModel,
  UserPreferenceModel,
  CompleteProfileModel,
  FriendshipModel,
  CommunityMemberModel
};

module.exports = db;