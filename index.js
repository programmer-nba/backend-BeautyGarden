require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./config/db");
connection();
app.use(express.json());
app.use(cors());


app.use("/", require("./router"));
app.use("/beautygraden/admin", require("./router/admin"));


const port = process.env.PORT || 4348;
app.listen(port, console.log(`Listening on port ${port}`));