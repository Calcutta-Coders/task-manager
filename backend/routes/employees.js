const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Employee = require("../models/Employee");

// GET /api/employees
// Get all employees
router.get("/", auth, async (req, res) => {
  try {
    const employees = await Employee.find().select(
      "firstName lastName role email team"
    );
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET /api/employees/me
// Get all employees
router.get("/me", auth, async (req, res) => {
  try {
    const employees = await Employee.findById(req.user.id).select(
      "firstName lastName role email team"
    );
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/count", auth, async (req, res) => {
  try {
    const employees = await Employee.findById(req.user.id);
    res.json(employees.clients.length);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
