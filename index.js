const express = require("express");
const app = express();
const port = 8080;

//Opens static content int public folder
app.use(express.static("public"));

//Listens on port 8080
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
