const sequelize= require('../config/db.js');

sequelize.sync({ force: true }).then(() => {
    console.log('Database & tables created!');
    process.exit();
  });
