const pool= require('../config/db.js');

const createJob= async(job)=>{
    const { user_id, title, description, location, company, salary, type } = job;
    if(!user_id || !title || !description || !location || !company || !type){
        throw new Error("Missing required fields");
    }
    const result = await pool.query(
        `INSERT INTO jobs (user_id, title, description, location, company, salary, type)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [user_id, title, description, location, company, salary, type]
      );
      return result.rows[0];
};

const getJobById= async(id)=>{
  try{
      if(!id){
        throw new Error("Missing Field Required");
      }
      const result= await pool.query(
        `SELECT * FROM jobs WHERE id = $1 AND is_active = true LIMIT 1`,
        [id]
      );
      return result.rows[0];
  } 
  catch(err){
    throw new Error("Error While Fetching the Job Details");
  }
}

const getJobsPostedByUser= async(user_id)=>{
  try{
      if(!user_id){
        throw new Error("Missing Field Required");
      }
      const result= await pool.query(
        `Select * from jobs where user_id = $1 AND is_active = true`,
        [user_id]
      );
      return result.rows;
  }
  catch(err){
    throw new Error("Error While Fetching the Job Details");
  }
}


const getJobs= async(limit, offset)=>{
    const result = await pool.query(
        `SELECT * FROM jobs WHERE is_active = true ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
};

module.exports= {createJob, getJobs, getJobById, getJobsPostedByUser};