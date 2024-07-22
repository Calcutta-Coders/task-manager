const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('./../models/Employee'); // Adjust the path as per your project structure
// const Superuser = require('./models/Superuser'); // Adjust the path as per your project structure

const router = express.Router();

// Route to handle login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists in either Employee or Superuser collection
        let user = await Employee.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }  
        console.log(password)
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const payload = {
            user: {
                id: user._id,
                email: user.email,
                userType: userType
            }
        };

        jwt.sign(payload, 'jwtSecret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Route to handle signup

// Route to handle employee signup
router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password, team, key } = req.body;

    try {
        // Check if the employee already exists
        let employee = await Employee.findOne({ email });

        if (employee) {
            return res.status(400).json({ message: 'Employee already exists' });
        }
        let role = 'analyst'
        if(key === 'happy')
            role = 'advisor'


        // Create a new employee instance
        employee = new Employee({
            firstName,
            lastName,
            email,
            password,
            team,
            role
        });
        console.log(password)
        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        employee.password = await bcrypt.hash(password, salt);

        // Save employee to database
        await employee.save();

        // Generate JWT token
        const payload = {
            user: {
                id: employee._id,
                email: employee.email,
                userType: 'employee'
            }
        };

        jwt.sign(payload, 'jwtSecret', { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
