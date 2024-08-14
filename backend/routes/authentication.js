const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Employee = require("./../models/Employee");

const router = express.Router();

// Route to handle login
router.post("/login", async (req, res) => {
  let { email, password } = req.body;

  console.log("Login attempt for email:", email);

  try {
    let user = await Employee.findOne({ email });

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user.email);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user._id,
        email: user.email,
        userType: user.role,
      },
    };

    jwt.sign(payload, "jwtSecret", (err, token) => {
      if (err) throw err;
      console.log("JWT token generated successfully");
      res.json({ token });
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).send("Server error");
  }
});

// Route to handle employee signup
router.post("/signup", async (req, res) => {
  let { firstName, lastName, email, password, team, key } = req.body;

  try {
    let employee = await Employee.findOne({ email });

    if (employee) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    let role = "analyst";
    if (key === "happy") role = "advisor";
    password = password.trim();
    // Hash password
    employee = new Employee({
      firstName,
      lastName,
      email,
      password: password,
      team,
      role,
    });

    await employee.save();

    console.log("Employee saved:", employee);

    const payload = {
      user: {
        id: employee._id,
        email: employee.email,
        userType: role,
      },
    };

    jwt.sign(payload, "jwtSecret", (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
