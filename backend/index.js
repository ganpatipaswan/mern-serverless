const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");

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
app.get("/users", async (req, res) => {
  try {
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
  "/upload_profile_pic",
  upload.single("image"),
  async (req, res) => {
    const { userId } = req.body;

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
