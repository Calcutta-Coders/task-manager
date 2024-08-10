const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/Task");
const Employee = require("../models/Employee");

// GET /api/tasks/:clientId
// Get tasks for a specific client, filtered by employee role
router.get("/:clientId", auth, async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const employee = await Employee.findById(req.user.id);
    console.log(employee);
    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    let tasks;

    if (employee.role === "analyst") {
      // For analysts, only fetch tasks assigned to them for the specified client
      tasks = await Task.find({
        client: clientId,
        to: employee._id,
      })
        .populate("from", "firstName lastName")
        .populate("to", "firstName lastName")
        .populate("client", "name");
    } else {
      // For advisors or other roles, fetch all tasks for the specified client
      tasks = await Task.find({
        client: clientId,
      })
        .populate("from", "firstName lastName")
        .populate("to", "firstName lastName")
        .populate("client", "name");
    }

    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { to, client, title, description, status, dueDate } = req.body;

    const newTask = new Task({
      to: to === "self" ? req.user.id : to, // If 'self' is selected, assign to the current user
      from: req.user.id,
      client,
      title,
      description,
      status,
      dueDate,
    });

    const savedTask = await newTask.save();

    // Populate the 'to' and 'from' fields with user information

    res.json(savedTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
