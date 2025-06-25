const {createJob, getJobs, getJobById, getJobsPostedByUser}= require('../models/jobModels.js');
const {applyToJob}= require('../models/applicationModel.js');
const {jobSchema, applicationSchema}= require('../validations/schema.js');
const {getChannel}= require('../config/rabbitmq.js');

exports.createJob = async (req, res) => {
    const { error, value } = jobSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message});
    try {
      const job = await createJob({ ...value, user_id: req.user.id });
      const channel = await getChannel();
      if (channel) {
        channel.sendToQueue('job_created', Buffer.from(JSON.stringify(job)));
      }
      console.log("Job created", job);
      res.status(201).json({ message: 'Job created', job });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  exports.getJobById= async(req, res)=>{
    const {id}= req.params;
    try{
        if(!id){
          return res.status(401).json({"message": "Job Id not defined"});
        }
        const job= await getJobById(id);
        if(!job){
          return res.status(401).json({"message": "Job Details not found"});
        }
        res.status(201).json({"message": "Job Details Found Successfully", job});
    }
    catch(err){
      return res.status(500).json({"error": "Internal Server Error"});
    }
  }
  
  exports.getJobsPostedByUser= async(req,res)=>{
    try{
        const {user_id}= req.params;
        if(!user_id){
          return res.status(401).json({"message": "User Id not defined"});
        }
        const jobs= await getJobsPostedByUser(user_id);
        if(!jobs){
          return res.status(401).json({"message": "Jobs not found"});
        }
        return res.status(201).json({"message": "Jobs Found Successfully", jobs});
    }
    catch(err){
      return res.status(500).json({"message": "Internal Server Error"});
    }
  }

  exports.getJobs = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    try {
      const jobs = await getJobs(limit, offset);
      res.json(jobs);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  exports.applyToJob = async (req, res) => {
    const { error, value } = applicationSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
  
    try {
      const application = await applyToJob({
        ...value,
        job_id: req.params.id,
        user_id: req.user.id
      });
      const channel = await getChannel();
      if (channel) {
        channel.sendToQueue('job_applied', Buffer.from(JSON.stringify(application)));
      }
      res.status(201).json({ message: 'Applied to job', application });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };