
//Creates the User Table

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('tags', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // Auto increment automatically sets the id value
            autoIncrement: true,
            // Primary key means this is the main identifier
            primaryKey: true,
            // Has to be unique
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        tagName : {
            type: DataTypes.TEXT,
            unique: true,
        },
        tagDescription : {
            type: DataTypes.TEXT,
        },
        tagEmoji:{
            type: DataTypes.TEXT,
        }
    })
};