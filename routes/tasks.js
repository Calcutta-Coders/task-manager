const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Employee = require('../models/Employee');

// Get all tasks for a specific client
router.get('/client/:clientId', async (req, res) => {
    try {
        const tasks = await Task.find({ client: req.params.clientId }).populate('to from client');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new task
router.post('/', async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update task by ID
router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete task by ID
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
