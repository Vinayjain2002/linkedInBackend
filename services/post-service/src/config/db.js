import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const pool= new Pool({
    connectionString: process.env.POSTGRES_URI
});

async function testDBConnection(){
    let client;

    try{
        client= await pool.connect();
        console.log('Connected to the database');

        const res= await client.query('SELECT NOW()');
        console.log('Database is running', res.rows[0].now);
    }
    catch(err){
        throw err;
    }
    finally{
        if(client){
            client.release();
            console.log('Client Released back to Pool');
        }
    }
}

testDBConnection();

export const connectDatabase= async()=>{
    try{
        await pool.connect();
        console.log('Connected to the database');
    }
    catch(err){
        console.error('Error connecting to the database:', err);
        throw err;
    }
}

