const {Pool} = require('pg');
const dotenv= require('dotenv');

dotenv.config();

const pool= new Pool({
  connectionString: process.env.POSTGRES_URI
});

const connectDatabase= async()=>{
  try{
      await pool.connect();
      console.log("Connected to the Database");
  }
  catch(err){
    console.error("Error connecting to the database:", err);
    throw err;
  }
}


async function testDBConnection(){
  let client;
  try{
      client= await pool.connect();
      console.log("Connected to Postgree SQL");

      const res= await client.query('SELECT NOW()');
      console.log("Postgree SQL", res.rows[0].now);

  }
  catch(err){
      throw err;
  }
  finally{
      if(client){
          client.release();
          console.log("Client Released back to Pool");
      }
  }
}

testDBConnection();


module.exports= {pool, connectDatabase};