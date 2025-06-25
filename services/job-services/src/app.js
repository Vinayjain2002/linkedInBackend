const express= require('express');
const morgan= require('morgan');
const cors= require('cors');
const helmet= require('helmet');
const dotenv= require('dotenv');
const jobRoutes= require('./routes/jobRoutes');
const errorHandler= require('./middlewares/errorHandler.js');
const {migrate}= require('./database/migrate.js');

dotenv.config();

const app= express();
app.use(morgan('combined'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/jobs', jobRoutes);

app.use(errorHandler);
module.exports= app;