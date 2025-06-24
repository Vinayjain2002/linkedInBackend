const express= require('express');
const connectionRoutes= require('./routes/connectionRoutes.js');
const errorHandler= require('./middlewares/errorHandler.js');
const cors= require('cors');
const dotenv= require('dotenv');
const helmet= require('helmet');
const morgan= require('morgan');

dotenv.config();
const app= express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));

app.use('/api/connections', connectionRoutes);
app.get('/health', (_,res)=> res.json({status: 'ok'}));

app.use(errorHandler);
app.use("*", (_,res)=>res.status(404).json({error: 'Route Not Found'}));

module.exports= app;