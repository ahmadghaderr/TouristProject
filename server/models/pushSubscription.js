const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

class PushSubscription extends Model {}

PushSubscription.init(
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    endpoint: { type: DataTypes.TEXT, allowNull: false, unique: true },
    p256dh: { type: DataTypes.STRING, allowNull: false },
    auth: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: 'PushSubscription',
    tableName: 'push_subscriptions',
    timestamps: true,
  }
);

PushSubscription.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PushSubscription, { foreignKey: 'userId' });

module.exports = PushSubscription;
