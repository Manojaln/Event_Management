const { Sequelize } = require('sequelize');
require('dotenv').config();
const { DatabaseConstants } = require('../constants/DatabaseConstants');

const sequelize = new Sequelize(

  {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port:process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
  }
);

const connect = async () => {

  console.log(process.env.DB_USER)
  try {
    await sequelize.authenticate();
    console.log(DatabaseConstants.ConnectionSuccessful);
  } catch (error) {
    console.error(DatabaseConstants.ConnectionFailed, error);
  }
};

connect();

module.exports = sequelize;
