
//Creates the User Table

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('users', {
        userId:{
            type: Sequelize.STRING,
            allowNull: false,
            // userId will be the main identifier of Discord users
            primaryKey: true,
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
    })
};