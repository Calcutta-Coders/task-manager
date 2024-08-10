const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Employee = require("../models/Employee");

// GET /api/employees
// Get all employees
router.get("/", auth, async (req, res) => {
  try {
    const employees = await Employee.find().select("firstName lastName role");
    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
