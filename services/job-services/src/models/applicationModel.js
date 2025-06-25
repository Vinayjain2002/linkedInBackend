const pool= require('../config/db.js');

const applyToJob= async(application)=>{
    const {job_id, user_id, cover_letter, resume_url}= application;
    if(!job_id || !user_id){
        throw new Error("Missing required fields");
    } 
    const result = await pool.query(
        `INSERT INTO job_applications (job_id, user_id, cover_letter, resume_url)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [job_id, user_id, cover_letter, resume_url]
      );
      return result.rows[0];
};

module.exports= {applyToJob};