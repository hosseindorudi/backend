const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();


const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.SECRET_TOKEN, {
      expiresIn: "30000s",
    });
  };
  
  const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.REFRESH_TOKEN);
  };
  

  const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
  
      jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
        if (err) {
          return res.status(403).json("توکن معتبر نیست!!!");
        }
  
        req.user = user;
        next();
      });
    } else {
      res.status(401).json("ورود شما مجاز نیست!!!");
    }
  };


  module.exports = {generateAccessToken, generateRefreshToken, verify}

