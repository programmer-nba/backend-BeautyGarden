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
app.use("/beautygraden/member" ,require("./router/member/index"))

//สร้างสาขา
app.use("/beautygraden/branch" ,require("./router/branch/index"))


const port = process.env.PORT || 4348;
app.listen(port, console.log(`Listening on port ${port}`));