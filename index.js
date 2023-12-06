const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator"); // Add these lines for validation
const cors = require("cors");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

//this URI is set to 'any IP can access'
const uri =
  "mongodb+srv://papayd7098:sourav@cluster0.teqfemr.mongodb.net/tasks?retryWrites=true&w=majority";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: String,
  isComplete: Boolean,
});

const Task = mongoose.model("Task", taskSchema);

// Validation middleware for POST and PUT requests
const validateTask = [
  body("title").notEmpty().withMessage("Title cannot be empty"),
  body("description").notEmpty().withMessage("Description cannot be empty"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.get("/", (req, res) => {
  res.send(`<h2>Server is running</h2>`);
});

// GET all tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

// GET task by ID
app.get("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new task with validation middleware
app.post("/tasks", validateTask, async (req, res) => {
  const task = new Task({
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate,
    isComplete: false,
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

// PUT update task with validation middleware
app.put("/tasks/:id", validateTask, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (updatedTask) {
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

// DELETE task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.deleteOne({ _id: req.params.id });
    if (deletedTask) {
      res.json({ message: "Task deleted successfully" });
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`see tasks:http://localhost:${port}/tasks`);
});
