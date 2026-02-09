const express = require("express");
const app = express();

app.get("/hello", (req, res) => {
  res.json({ message: "Hello World from Express + Lambda 🚀 test ---" });
});

module.exports = app;


// const express = require("express");
// const mongoose = require("mongoose");

// const app = express();
// app.use(express.json());

// let cachedConn = null;

// async function connectDB() {
//   if (cachedConn) return cachedConn;

//   cachedConn = await mongoose.connect(process.env.MONGO_URI, {
//     serverSelectionTimeoutMS: 5000,
//   });

//   console.log("MongoDB connected");
//   return cachedConn;
// }

// const TodoSchema = new mongoose.Schema({ title: String });
// const Todo = mongoose.models.Todo || mongoose.model("Todo", TodoSchema);

// app.get("/todos", async (req, res) => {
//   try {
//     await connectDB();
//     const todos = await Todo.find();
//     res.json(todos);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "DB connection failed" });
//   }
// });

module.exports = app;
