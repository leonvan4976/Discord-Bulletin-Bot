
//Creates the User Table

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('posts', {
        id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            // Auto increment automatically sets the id value
            autoIncrement: true,
            // Has to be unique
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        // Holds a foreign key to the owner of the post
        userId: DataTypes.STRING,
        messageContent: DataTypes.TEXT
    })
};