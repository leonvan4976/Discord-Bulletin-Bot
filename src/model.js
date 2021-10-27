const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

//Creates the User Table
const User = sequelize.define("User",{
    
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        // A primary key is the main identifier for a specific row
        primaryKey: true,
        // Has to be unique
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    apiId:{
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    userName:{
        type: Sequelize.TEXT,
        allowNull: false,
    },
    banned:{
        type: Sequelize.BOOLEAN
    },
});

module.exports = User;