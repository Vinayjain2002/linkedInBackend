const express= require('express');
const commentRoutes= require('./routes/commentRoutes.js');
const errorHandler= require('./middlewares/errorHandler.js');
const cors= require('cors');
const helmet= require('helmet');
const morgan= require('morgan');

const app= express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));



app.use('/api/comments', commentRoutes);
app.get('/health', (_,res)=> res.json({status: 'ok'}));

app.use("*", (_,res)=>res.status(404).json({error: 'Route Not Found'}));
app.use(errorHandler);

module.exports= app;