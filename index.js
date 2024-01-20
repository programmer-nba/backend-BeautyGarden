require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./config/db");
connection();


app.use("/", require("./router"));

const port = process.env.PORT || 4348;
app.listen(port, console.log(`Listening on port ${port}`));