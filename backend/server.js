const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authentication"); // Adjust the path as per your project structure
const clientRoutes = require("./routes/clients");

// Setup express app
const app = express();

let allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  next();
};
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// Middleware
app.use(express.json()); // Body parser middleware
app.use(allowCrossDomain);

// Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/clients", clientRoutes);

app.use(bodyParser.json());

// Configure Mongo
const db = "mongodb://localhost/tm";

// Connect to Mongo with Mongoose
mongoose
  .connect(
    db
    // { useNewUrlParser: true }
  )
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.log(err));

// Specify the Port where the backend server can be accessed and start listening on that port
const port = process.env.PORT || 5500;
app.listen(port, () => console.log(`Server up and running on port ${port}.`));
