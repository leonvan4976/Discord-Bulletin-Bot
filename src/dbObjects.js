const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Users = require('./models/Users.js')(sequelize, Sequelize.DataTypes);
const Posts = require('./models/Posts.js')(sequelize, Sequelize.DataTypes);
const Subscriptions = require('./models/Subscriptions.js')(sequelize, Sequelize.DataTypes);
const Tags =  require('./models/Tags.js')(sequelize, Sequelize.DataTypes);
const PostTags = require('./models/PostTags.js')(sequelize, Sequelize.DataTypes);

// Add associations to the models

// "The User possesses many posts"
Users.hasMany(Posts, {foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
// "The User possess many subscription tags"
Users.hasMany(Subscriptions, {foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
// "Each post has many post tags to categorize it."
Posts.hasMany(PostTags, {foreignKey: 'postId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Tags.hasMany(Subscriptions, {foreignKey: 'tagId'});
Tags.hasMany(PostTags, {foreignKey: 'tagId'});

module.exports = { Users, Posts, Subscriptions, Tags, PostTags };