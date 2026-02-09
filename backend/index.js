const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");

const bcrypt = require("bcryptjs");
const { generateToken } = require("./auth");
const authMiddleware = require("./middleware/authMiddleware");

const dynamoDB = require("./dynamodb");
const s3 = require("./s3");

const app = express();
app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */
app.get("/hello", (req, res) => {
  res.json({ message: "Hello World from Express + Lambda 🚀" });
});

/* =========================
   GET ALL USERS
========================= */
  app.get("/users", authMiddleware, async (req, res) => {
    try{
    const data = await dynamoDB.scan({
      TableName: "Users"
    }).promise();

  
    res.json({
      success: true,
      users: data.Items
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================
   CREATE USER
========================= */
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

    res.json({ success: true, message: "User created" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/signup", async (req, res) => {
  const { userId, name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await dynamoDB.put({
      TableName: "Users",
      Item: {
        userId,
        name,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      }
    }).promise();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/login", async (req, res) => {
  const { userId, password } = req.body;

  try {
    const data = await dynamoDB.get({
      TableName: "Users",
      Key: { userId }
    }).promise();

    if (!data.Item) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, data.Item.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({
      userId: data.Item.userId,
      email: data.Item.email
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   PROFILE IMAGE UPLOAD
========================= */
const upload = multer({
  storage: multerS3({
    s3,
    bucket: "user-profile-images-797882812918",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const userId = req.body.userId;
      const ext = file.originalname.split(".").pop();
      cb(null, `profiles/${userId}.${ext}`);
    }
  })
});

/**
 * POST /upload_profile_pic
 * form-data:
 *  - userId
 *  - image (file)
 */
app.post(
  "/upload_profile_pic",authMiddleware,
  upload.single("image"),
  async (req, res) => {
    // const { userId } = req.body;
    const { userId } = req.user; // from JWT

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image required" });
    }

    const imageUrl = req.file.location;

    try {
      await dynamoDB.update({
        TableName: "Users",
        Key: { userId },
        UpdateExpression: "SET profile_image = :img",
        ExpressionAttributeValues: {
          ":img": imageUrl
        }
      }).promise();

      res.json({
        success: true,
        message: "Profile image uploaded",
        profile_image: imageUrl
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

module.exports = app;
