require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = checkToken = async (req, res, next) => {
    let token = req.headers["auth-token"];
  // token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTU1ODFmMmI3MDViMjg3OTdlMDgyZmMiLCJuYW1lIjoicmFtMSIsInNob3BfaWQiOiI2NTUwMzI0NTRkNmY5ZDk3NWU3ZDVjNTkiLCJwaG9uZSI6IjA5MDk1MDA3MDkiLCJyb3ciOiJlbXBsb3llZSIsImlhdCI6MTcwMDcyNTkyOSwiZXhwIjoxNzAwNzQwMzI5fQ.bUPBBuYoqlht9W1hrb3JfYLFLvfHgj_MZwyPZagT1k4"
    if (token) {
      token = token.replace(/^Bearer\s+/, "");
      jwt.verify(token, process.env.JWTPRIVATEKEY, (err, decoded) => {
        if (err) {
          return res.status(408).json({
            success: false,
            message: "หมดเวลาใช้งานแล้ว หรือ สิทธิการใช้งานเฉพาะ เเอดมิน",
            logout: true,
            description: "Request Timeout Or Employee Only",
          });
        }
        
        req.decoded = decoded;
  
        if (decoded.row !== "admin") {
          return res.status(401).json({
            success: false,
            message: "ไม่มีสิทธิใช้งานฟังก์ชั่นนี้",
            logout: true,
            description: "Unauthorized",
            token
          });
        }
        next();
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Token not provided Token ไม่ถูกต้อง",
        logout: false,
        description: "Unauthorized",
      });
    }
  };