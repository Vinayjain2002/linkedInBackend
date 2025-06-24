const express= require('express');
const connectionRoutes= require('./routes/connectionRoutes.js');
const errorHandler= require('./middlewares/errorHandler.js');
const cors= require('cors');
const dotenv= require('dotenv');

dotenv.config();
const app= express();

app.use(express.json());
app.use(cors());
app.use('/api/connections', connectionRoutes);
app.get('/health', (_,res)=> res.json({status: 'ok'}));

app.use(errorHandler);



module.exports= app;