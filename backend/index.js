const express = require("express");
const app = express();
const dynamoDB = require("./dynamodb");

app.use(express.json());

// TEST API – checks DynamoDB connection
app.get("/users", async (req, res) => {
  try {
    const data = await dynamoDB.scan({
      TableName: "Users"
    }).promise();

    res.json({
      success: true,
      users: data.Items
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// CREATE USER API
app.post("/users", async (req, res) => {
  const { userId, name, email } = req.body;

  try {
    await dynamoDB.put({
      TableName: "Users",
      Item: {
        userId,
        name,
        email,
        createdAt: new Date().toISOString()
      }
    }).promise();

    res.json({ success: true, message: "User created test" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = app;
