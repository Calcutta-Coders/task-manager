const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/Task");
const Employee = require("../models/Employee");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Client = require("../models/Client");
// GET /api/tasks/:clientId
// Get tasks for a specific client, filtered by employee role
router.get("/download/:filename", auth, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads", filename); // Adjust the path as needed

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ msg: "File not found" });
    }

    // Set headers
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/octet-stream");

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

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
router.get("/:clientId/", auth, async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const filter = req.headers.filter;
    const employee = await Employee.findById(req.user.id);

    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    let tasks;
    const taskQuery =
      employee.role === "advisor" && filter == "true"
        ? { client: clientId }
        : { client: clientId, to: employee._id };

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
// GET /api/tasks/from/:clientId
// Get tasks for a specific client, filtered by employee role
router.get("/from/:clientId", auth, async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const employee = await Employee.findById(req.user.id);

    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    let tasks;
    const taskQuery = { client: clientId, from: employee._id };

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

    // Find the client
    const clientObject = await Client.findById(client);
    if (!clientObject) {
      return res.status(404).json({ msg: "Client not found" });
    }

    // Find the employee (user creating the task)
    const apparentTo = to != "self" ? to : req.user.id;
    const employee = await Employee.findById(apparentTo);
    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    // Check if the client is already in the employee's list
    if (!employee.clients.includes(client)) {
      employee.clients.push(client);
      await employee.save();
    }

    const newTask = new Task({
      to: to === "self" ? req.user.id : to,
      from: req.user.id,
      client,
      title,
      description,
      status,
      dueDate,
    });

    if (req.files && req.files.length > 0) {
      newTask.attachments = req.files.map((file) => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
      }));
    }

    const savedTask = await newTask.save();

    // Add the task to the employee's tasks list
    employee.tasks.push(savedTask._id);
    await employee.save();

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
    console.log("Request body", req.body);
    const { title, description, dueDate, status } = req.body;

    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    // Update task fields
    if (title) task.title = title;
    if (description) task.description = description;
    // if (to) task.to = to === "self" ? req.user.id : to;
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
      task.attachments = task.attachments
        ? [...task.attachments, ...newFiles]
        : newFiles;
    }

    task.updatedAt = Date.now();
    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET /api/tasks/pending/:clientId
// Get pending tasks for a specific client assigned to the authenticated employee
router.get("/pending/:clientId", auth, async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const employeeId = req.user.id;
    let pendingTasks;
    if (clientId != "all") {
      pendingTasks = await Task.find({
        client: clientId,
        to: employeeId,
        status: { $in: ["Pending", "To do"] },
      })
        .populate("from", "firstName lastName")
        .populate("client", "name")
        .select(
          "title description dueDate createdAt updatedAt attachments status"
        );
    } else {
      pendingTasks = await Task.find({
        // client: clientId,
        to: employeeId,
        status: { $in: ["Pending", "To do"] },
      })
        .populate("from", "firstName lastName")
        .populate("client", "name _id")

        .select(
          "title description dueDate createdAt updatedAt attachments status"
        );
    }

    // Format the response to include file information
    const formattedTasks = pendingTasks.map((task) => {
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

module.exports = router;
