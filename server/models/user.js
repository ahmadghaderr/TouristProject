const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class User extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = String(values.id);
    delete values.password;
    delete values.verificationToken;
    return values;
  }
}

User.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'manager',
      validate: { isIn: [['admin', 'manager']] },
    },
    isVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    verificationToken: { type: DataTypes.STRING, allowNull: true },
    verificationTokenExpires: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

module.exports = User;