const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import authentication middleware
const Client = require('../models/Client'); // Assuming you have a Client model

// @route   GET /api/clients
// @desc    Get clients (filtered by user role)
// @access  Private (requires authentication)
router.get('/', auth, async (req, res) => {
  try {
    let clients;

    if (req.user.role === 'analyst') {
      // If user is an analyst, fetch clients assigned to them
      clients = await Client.find({ tasks: { $in: req.user.tasks } }); // Assuming tasks are populated with client IDs
    } else {
      // If user is an advisor, fetch all clients
      clients = await Client.find();
    }

    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
