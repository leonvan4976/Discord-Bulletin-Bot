
//Creates the User Table

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('posts', {
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
        // NOTE: The user ID foreign key is set up in dbInit.
        messageContent: DataTypes.TEXT
    })
};