
//Creates the User Table

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('subscriptions', {
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
        // Note: The userId foreign key is set up in dbInit.
        // Note: Subscriptions will have many tags
    })
};