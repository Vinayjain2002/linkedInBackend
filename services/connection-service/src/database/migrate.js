const sequelize = require('../config/db');
const Connection = require('../models/connectionModel');

sequelize.sync({ force: true }).then(() => {
  console.log('Database & tables created!');
  process.exit();
});
