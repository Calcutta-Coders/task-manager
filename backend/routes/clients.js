const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Client = require("../models/Client");
const Employee = require("../models/Employee");
const Task = require("../models/Task");
// @route   GET /api/clients
// @desc    Get clients (filtered by user role and search term)
// @access  Private (requires authentication)
router.get("/", auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    if (req.user.role === "analyst") {
      query.tasks = { $in: req.user.tasks };
    }

    const clients = await Client.find(query)
      .populate({
        path: "tasks",
        match: { status: "pending" },
        select: "status",
      })
      .select("_id name email company phone");

    const result = clients.map((client) => ({
      _id: client._id,
      name: client.name,
      email: client.email,
      company: client.company,
      phone: client.phone,
      pendingTasksCount: client.tasks.length,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/clients/specific
// @desc    Get clients associated with the authenticated employee
// @access  Private (requires authentication)
router.get("/specific", auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).populate({
      path: "clients",
      populate: {
        path: "tasks",
        match: { status: "pending" },
        select: "status",
      },
      select: "_id name email company phone",
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const result = employee.clients.map((client) => ({
      _id: client._id,
      name: client.name,
      email: client.email,
      company: client.company,
      phone: client.phone,
      pendingTasksCount: client.tasks.length,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST /api/clients
// @desc    Add a new client
// @access  Private (requires authentication)
router.post("/", auth, async (req, res) => {
  try {
    const { name, email, company, phone } = req.body;

    // Check if client already exists
    let client = await Client.findOne({ email });
    if (client) {
      return res.status(400).json({ message: "Client already exists" });
    }

    // Create new client
    client = new Client({
      name,
      email,
      company,
      phone,
    });

    await client.save();

    // Add client to the authenticated employee's client list
    const employee = await Employee.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    employee.clients.push(client._id);
    await employee.save();

    res.status(201).json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/add-to-employee", auth, async (req, res) => {
  try {
    const { clientId } = req.body;

    // Find the client
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Find the authenticated employee
    const employee = await Employee.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check if the client is already in the employee's client list
    if (employee.clients.includes(clientId)) {
      return res
        .status(400)
        .json({ message: "Client already added to employee's list" });
    }

    // Add client to employee's client list
    employee.clients.push(clientId);
    await employee.save();

    res.status(200).json({ message: "Client added to employee's list" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
