const express= require('express');
const commentRoutes= require('./routes/commentRoutes.js');
const errorHandler= require('./middlewares/errorHandler.js');
const sequelize= require('./config/db.js');
const cors= require('cors');
const { Sequelize } = require('sequelize');

const app= express();
app.use(express.json());
app.use(cors());

app.use('/api/comments', commentRoutes);
app.get('/health', (_,res)=> res.json({status: 'ok'}));

app.use(errorHandler);

Sequelize.sync().then(()=>{
    console.log('Database & tables created!');
});

module.exports= app;