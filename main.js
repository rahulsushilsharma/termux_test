const print = console.log;
const express = require("express");
const app = express();
app.use(express.json());

app.use("/", express.static("public"));
app.listen(8080);
print("server running at: http://localhost:8080/");
