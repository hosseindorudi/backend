const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const {verify} = require('./verifyToken')
const dotenv = require("dotenv");
dotenv.config();


//update user
router.put("/:id",verify, async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("اکانت شما با موفقیت بروزرسانی شد");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("شما فقط میتوانید اکانت خودتان را بروزرسانی کنید");
  }
});

//delete user
router.delete("/:id",verify, async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("اکانت مورد نظر حذف شد");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("شما فقط میتوانید اکانت خودتان را حذف کنید");
  }
});

//get a user
router.get("/:id",verify, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
