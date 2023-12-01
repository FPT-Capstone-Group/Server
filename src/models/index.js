const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
// eslint-disable-next-line import/no-dynamic-require
const config = require(`${__dirname}/../config/config.js`)[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// relationships for models

//= ==============================
// Define all relationships here below, default naming sequelize will do for you
//= ==============================
// db.User.hasMany(db.Address);
// db.Address.belongsTo(db.User);

// // User bussines logic
// db.User.hasMany(db.UserHistory);
// db.UserHistory.belongsTo(db.User);
// db.User.hasMany(db.Notification);
// db.Notification.belongsTo(db.User);
// db.User.hasMany(db.Bike);
// db.Bike.belongsTo(db.User);
// db.User.hasMany(db.Card);
// db.Card.belongsTo(db.User);

// // Owner bussines logic
// db.User.hasMany(db.Owner);
// db.Owner.belongsTo(db.User);

// Role Business Logic, User can be admin ,staff or user
// db.Role.belongsTo(db.User);
// db.User.hasMany(db.Role);
// db.User.belongsToMany(db.Role, { through: db.UserRole });
// db.Role.belongsToMany(db.User, { through: db.UserRole });

// // Registration bussines logic
// db.User.hasMany(db.Registration);
// db.Registration.belongsTo(db.User);
// db.Registration.hasMany(db.RegistrationHistory);
// db.RegistrationHistory.belongsTo(db.Registration);

// // Payment bussines logic
// db.Registration.hasMany(db.Payment);
// db.Payment.belongsTo(db.Registration);


// // ParkingSession bussines logic
// db.ParkingType.hasMany(db.ParkingSession);
// db.ParkingSession.belongsTo(db.ParkingType);

// //Card bussines logic
// db.CardHistory.belongsTo(db.Card);
// db.Card.hasMany(db.CardHistory);

module.exports = db;
