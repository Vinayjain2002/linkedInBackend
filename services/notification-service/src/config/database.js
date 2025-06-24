const {Pool} = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'linkedin_notifications',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

const connectDatabase= async ()=>{
    try{
         await pool.connect();
        console.log('Connected to the database');
    }
    catch(err){
        console.error('Error connecting to the database:', err);
        throw err;
    }
}

module.exports= {pool, connectDatabase};