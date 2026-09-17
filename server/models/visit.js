const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

class Visit extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = String(values.id);
    return values;
  }

  calculateTotalCost() {
    const fullDaysPrice = (this.pricePerDay || 0) * (this.totalDays || 0);
    const arrival = this.arrivalPrice || 0;
    const departure = this.departurePrice || 0;

    if (this.type === 'full-days') {
      return fullDaysPrice;
    } else if (this.type === 'arrival-departure') {
      return arrival + departure;
    } else if (this.type === 'mixed') {
      return fullDaysPrice + arrival + departure;
    }
    return 0;
  }
}

Visit.init(
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    hotel: { type: DataTypes.STRING, allowNull: false },
    car: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM('full-days', 'arrival-departure', 'mixed'),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('Personal', 'Omar Maroun', 'Syria Trip'),
      allowNull: true,
    },
    dateFrom: DataTypes.DATE,
    dateTo: DataTypes.DATE,
    pricePerDay: DataTypes.FLOAT,
    totalDays: DataTypes.INTEGER,
    arrivalPrice: DataTypes.FLOAT,
    departurePrice: DataTypes.FLOAT,
    fullPricePackages: DataTypes.FLOAT,
    totalCost: DataTypes.FLOAT,
    isPaid: { type: DataTypes.BOOLEAN, defaultValue: false },
    arrivalEventId: DataTypes.STRING,
    departureEventId: DataTypes.STRING,
    arrivalReminderSent: { type: DataTypes.BOOLEAN, defaultValue: false },
    departureReminderSent: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: 'Visit',
    tableName: 'visits',
    timestamps: true,
    updatedAt: false,
  }
);

Visit.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Visit, { foreignKey: 'userId' });

module.exports = Visit;