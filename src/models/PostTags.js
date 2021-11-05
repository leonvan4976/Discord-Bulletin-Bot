
//Creates the User Table

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('posttags', {
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
        // Note: postId is a foreign key (Set up in dbinit)
        // Note: tagId is a foreign key (Set up in dbinit)
        tagName : {
            type: DataTypes.TEXT,
        }
    })
};