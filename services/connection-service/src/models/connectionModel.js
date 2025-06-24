const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Connection = sequelize.define('Connection', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  requesterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  addresseeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['requesterId', 'addresseeId']
    }
  ]
});

module.exports = Connection;

