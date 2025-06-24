const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const connectionController = require('../controllers/connectionController');

router.post('/request', auth, connectionController.sendRequest);

// Accept a connection request
router.post('/:connectionId/accept', auth, connectionController.acceptRequest);

// Reject a connection request
router.post('/:connectionId/reject', auth, connectionController.rejectRequest);

// List all accepted connections for the user
router.get('/', auth, connectionController.listConnections);

// List all pending requests for the user
router.get('/pending', auth, connectionController.listPending);

module.exports = router;

