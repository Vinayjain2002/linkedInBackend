const express= require('express');
const router=express.Router();
const jobController= require('../controller/jobController.js');
const authMiddleware= require('../middlewares/auth.js');

router.post('/', authMiddleware, jobController.createJob);
router.get('/', jobController.getJobs);
router.get('/:id/apply', authMiddleware, jobController.applyToJob);
router.get('/:user_id/posted', authMiddleware, jobController.getJobsPostedByUser);
router.get('/:id', authMiddleware, jobController.getJobById);

module.exports= router;