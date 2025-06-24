const express= require('express');
const cors= require('cors');
const helmet= require('helmet');
const morgan= require('morgan');


const postRoutes= require('./routes/postRoutes.js');
const errorHandler= require('./middlewares/errorHandler.js');

const app= express();

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended: true, limit: '10mb'}));

app.use('/api/posts', postRoutes);
app.use(errorHandler);

app.use("*", (_,res)=>res.status(404).json({error: 'Route Not Found'}));

module.exports= app;