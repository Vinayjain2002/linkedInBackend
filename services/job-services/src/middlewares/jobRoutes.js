const express= require('express');
const router=express.Router();
const jobController= require('../controller/jobController.js');
const authMiddleware= require('../middlewares/auth.js');

router.post('/create/', authMiddleware, jobController.createJob);
router.get('/', jobController.getJobs);
router.get('/:id', authMiddleware, jobController.getJobById);

router.get('/:id/apply', authMiddleware, jobController.applyToJob);

module.exports= router;