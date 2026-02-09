const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  region: "ap-south-1"
});

module.exports = s3;
