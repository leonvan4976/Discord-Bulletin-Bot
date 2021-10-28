const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

// Set up tables in database
const Users = require('./models/Users.js')(sequelize, Sequelize.DataTypes);
const Posts = require('./models/Posts.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

// Add associations to the models

Users.hasMany(Posts, {foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

sequelize.sync({ force }).catch(console.error);

