// // exports.handler = async (event) => {
// //     console.log(event);
// //     return 'Hello from Lambda!';
// //   };
const serverless = require("serverless-http");
const app = require("./index");

module.exports.handler = serverless(app);


// module.exports.hello = async () => {
//     return {
//       statusCode: 200,
//       body: JSON.stringify({
//         message: "Hello deployed via Serverless 🚀pppp"
//       })
//     };
//   };
  
  