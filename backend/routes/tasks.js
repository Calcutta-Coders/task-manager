const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/Task");
const Employee = require("../models/Employee");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// GET /api/tasks/:clientId
// Get tasks for a specific client, filtered by employee role

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// GET /api/tasks/:clientId
// Get tasks for a specific client, filtered by employee role
router.get("/:clientId", auth, async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const employee = await Employee.findById(req.user.id);

    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    let tasks;
    const taskQuery =
      employee.role === "analyst"
        ? { client: clientId, to: employee._id }
        : { client: clientId };

    tasks = await Task.find(taskQuery)
      .populate("from", "firstName lastName")
      .populate("to", "firstName lastName")
      .populate("client", "name")
      .select(
        "title description status dueDate createdAt updatedAt attachments"
      );

    // Format the response to include file information
    const formattedTasks = tasks.map((task) => {
      const taskObj = task.toObject();
      if (taskObj.attachments && taskObj.attachments.length > 0) {
        taskObj.attachments = taskObj.attachments.map((file) => ({
          filename: file.filename,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          uploadDate: file.uploadDate,
        }));
      }
      return taskObj;
    });

    res.json(formattedTasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
router.post("/", auth, upload.array("files", 5), async (req, res) => {
  try {
    const { to, client, title, description, status, dueDate } = req.body;

    const newTask = new Task({
      to: to === "self" ? req.user.id : to,
      from: req.user.id,
      client,
      title,
      description,
      status,
      dueDate,
    });
    console.log(req.files);
    if (req.files && req.files.length > 0) {
      newTask.attachments = req.files.map((file) => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      }));
    }

    const savedTask = await newTask.save();
    res.json(savedTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["To do", "Pending", "Completed"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    task.status = status;
    task.updatedAt = Date.now();
    await task.save();

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// DELETE /api/tasks/:id
// Delete a task
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    res.json({ msg: "Task removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// PUT /api/tasks/:id
// Edit a task
// Edit a task
// Edit a task
router.put("/:id", auth, upload.array("files", 5), async (req, res) => {
  try {
    const { title, description, to, dueDate, status } = req.body;

    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    // Update task fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (to) task.to = to === "self" ? req.user.id : to;
    if (dueDate) task.dueDate = dueDate;
    if (status) task.status = status;

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map((file) => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      }));
      task.files = task.files ? [...task.files, ...newFiles] : newFiles;
    }

    task.updatedAt = Date.now();
    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
