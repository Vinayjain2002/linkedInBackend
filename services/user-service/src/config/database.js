const {Pool} = require('pg');
const dotenv= require('dotenv');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on('connect', ()=>{
    console.log('Postgres Pool Connected');
});

pool.on('error', (error)=>{
    console.error('Postgres Pool Error:', error);
});

module.exports= pool;