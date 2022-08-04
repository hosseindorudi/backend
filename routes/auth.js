const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const {generateAccessToken} = require('./verifyToken')
const {generateRefreshToken} = require('./verifyToken')
const {verify} = require('./verifyToken')

//REGISTER
router.post("/register", async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create new user
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      password: hashedPassword,
    });

    const findEmail =  await User.findOne({ email: req.body.email })
    if(findEmail) {
      return res.status(409).json("اکانت با این ایمیل وجود دارد")
    } else {
    const findPhone =  await User.findOne({ phoneNumber: req.body.phoneNumber })
      if(findPhone) {
        return res.status(409).json("اکانت با این شماره موجود است")
      }
    }

    //save user and respond
    const user = await newUser.save();
    res.status(200).json("اکانت شما با موفقیت ساخته شد");
  } catch (err) {
    res.status(500).json(err)
  }
});


let refreshTokens = [];

router.post("/api/refresh", (req, res) => {
  //take the refresh token from the user
  const refreshToken = req.body.token;

  //send error if there is no token or it's invalid
  if (!refreshToken) return res.status(401).json("شما احراز هویت نشده اید!!!");
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("تاییدیه توکن معتبر نیست!!!");
  }
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
    err && console.log(err);
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });

  //if everything is ok, create new access token, refresh token and send to user
});


//LOGIN
router.post("/login", async (req, res) => {
  try {

    let user ;
    if(req.body.email) {
        user =  await User.findOne({ email: req.body.email })
    }else if (req.body.phoneNumber) {
        user = await User.findOne({ phoneNumber: req.body.phoneNumber }) 
    }else {
      return res.status(400).json("لطفا یکی از فیلد های ایمیل یا شماره تماس را وارد کنید")

    }
     if(!user){
        return res.status(404).json("حساب مورد نظر وجود ندارد");
        }
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword){ 
        return res.status(400).json("رمز وارد شده اشتباه است")

        }else {
      //Generate an access token
      const accessToken =  generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      refreshTokens.push(refreshToken);
      return res.status(200).json({
        fullName: user.firstName + " " + user.lastName,
        isAdmin: user.isAdmin,
        accessToken,
        refreshToken,
      });
    }    

    
  } catch (err) {
    res.status(500).json(err)
  }
});


router.post("/api/logout", verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json("خروج شما از حسابتان موفقیت آمیز بود");
});



module.exports = router;
