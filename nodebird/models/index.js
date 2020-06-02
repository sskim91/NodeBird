const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require('./user')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);

//사용자와 게시글은 1:N의 관계.
db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);

//게시글과 해시태그는 N:M의 관계 . 게시글 하나는 해시태그를 여러개 가질 수 있고 해시태그 하나도 게시글을 여러 개 가질 수 있다.
//다대다 관계에서는 새로운 모델 (테이블)이 생성된다.
//post 데이터에는 getHashTags, addHashTags등의 메서드를 추가
//hashtag 데이터에는 getPosts, addPosts 등의 메서드를 추가
db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' });

//같은 테이블 끼리도 N:M 관계를 가질 수 있다. 팔로잉 기능 : 사용자 한명이 팔로워를 여러명 가질 수도 있고, 여러 명을 팔로잉할 수도 있다.
db.User.belongsToMany(db.User, {
  foreignKey: 'followingId',
  as: 'Followers',
  through: 'Follow',
});
db.User.belongsToMany(db.User, {
  foreignKey: 'followerId',
  as: 'Followings',
  through: 'Follow',
});

//게시글 좋아요
db.User.belongsToMany(db.Post, {through: 'Like'});
db.Post.belongsToMany(db.User, {through: 'Like'});

module.exports = db;