const Connection = require('../models/connectionModel');
const { createConnectionSchema } = require('../validations/schema.js');

// Send a connection request
exports.sendRequest = async (req, res, next) => {
  try {
    const { error } = createConnectionSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const requesterId = req.user.id;
    const { addresseeId } = req.body;

    if (requesterId === addresseeId) {
      return res.status(400).json({ error: "Cannot connect to yourself" });
    }

    // Prevent duplicate requests
    const existing = await Connection.findOne({
      where: { requesterId, addresseeId }
    });
    if (existing) return res.status(409).json({ error: "Request already sent" });

    const connection = await Connection.create({ requesterId, addresseeId });
    res.status(201).json(connection);
  } catch (err) {
    next(err);
  }
};

// Accept a connection request
exports.acceptRequest = async (req, res, next) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    const connection = await Connection.findByPk(connectionId);
    if (!connection) return res.status(404).json({ error: "Request not found" });
    if (connection.addresseeId !== userId) return res.status(403).json({ error: "Unauthorized" });
    if (connection.status === 'rejected') {
      return res.status(400).json({ error: "Request has already been rejected" });
    }

    if (connection.status === 'accepted') {
      return res.status(400).json({ error: "Request has already been accepted" });
    }

    // Only allow if current status is 'pending'
    if (connection.status !== 'pending') {
      return res.status(400).json({ error: "Invalid request state" });
    }
    connection.status = 'accepted';
    await connection.save();
    res.json(connection);
  } catch (err) {
    next(err);
  }
};

// Reject a connection request
exports.rejectRequest = async (req, res, next) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user.id;

    const connection = await Connection.findByPk(connectionId);
    if (!connection) return res.status(404).json({ error: "Request not found" });
    if (connection.addresseeId !== userId) return res.status(403).json({ error: "Unauthorized" });
    if (connection.status === 'rejected') {
      return res.status(400).json({ error: "Request has already been rejected" });
    }

    if (connection.status === 'accepted') {
      return res.status(400).json({ error: "Request has already been accepted" });
    }

    // Only allow if current status is 'pending'
    if (connection.status !== 'pending') {
      return res.status(400).json({ error: "Invalid request state" });
    }
    connection.status = 'rejected';
    await connection.save();
    res.json(connection);
  } catch (err) {
    next(err);
  }
};

// List all connections for a user
exports.listConnections = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const connections = await Connection.findAll({
      where: {
        status: 'accepted',
        [Connection.sequelize.Op.or]: [
          { requesterId: userId },
          { addresseeId: userId }
        ]
      }
    });
    res.json(connections);
  } catch (err) {
    next(err);
  }
};

// List all pending requests for a user
exports.listPending = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const requests = await Connection.findAll({
      where: {
        addresseeId: userId,
        status: 'pending'
      }
    });
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

