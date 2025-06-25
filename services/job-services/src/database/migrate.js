const pool= require('../config/db.js');

async function migrate(){
    await pool.query(`CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      location VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      salary INTEGER,
      type VARCHAR(50) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS job_applications (
      id SERIAL PRIMARY KEY,
      job_id INTEGER REFERENCES jobs(id),
      user_id INTEGER NOT NULL,
      cover_letter TEXT,
      resume_url TEXT,
      status VARCHAR(50) DEFAULT 'applied',
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    console.log('Database migrated successfully');
};


module.exports= {migrate};