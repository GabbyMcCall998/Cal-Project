'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    name1: DataTypes.STRING,
    name2: DataTypes.STRING,
    email: DataTypes.VARCHAR(255),
    password: DataTypes.CHAR,
    
  },
  
  
  {
    sequelize,
    modelName: 'User',
  });
  return User;
};