const {Sequelize} = require("sequelize");

module.exports = new Sequelize(
    "palen-assistant-bot",
    "postgres",
    "12345678",
    {
        dialect: "postgres",
    }
)