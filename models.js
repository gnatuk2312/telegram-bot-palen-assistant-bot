const {DataTypes} = require("sequelize");
const sequelize = require("./db");

module.exports = { 
    User: sequelize.define('user', {
        id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
        chatId: {type: DataTypes.STRING, unique: true},
        firstName: {type: DataTypes.STRING},
        lastName: {type: DataTypes.STRING},
        right: {type: DataTypes.INTEGER, defaultValue: 0},
        wrong: {type: DataTypes.INTEGER, defaultValue: 0},
    })
}