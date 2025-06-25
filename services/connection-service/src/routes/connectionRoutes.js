const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.js');
const connectionController = require('../controllers/connectionController.js');

router.post('/request', auth, connectionController.sendRequest);
router.post('/:connectionId/accept', auth, connectionController.acceptRequest);
router.post('/:connectionId/reject', auth, connectionController.rejectRequest);

router.get('/', auth, connectionController.listConnections);

// List all pending requests for the user
router.get('/pending', auth, connectionController.listPending);

module.exports = router;

