const router = require("express").Router();
const Intro = require("../models/Intro");
const User = require("../models/User");
const upload = require("../middleware/upload")
const {verify} = require('./verifyToken')
const fs = require('fs');
const formidable = require("formidable")

// create a intro
router.post("/", upload.single('coverPic'), async (req, res) => {


    const allIntro = await Intro.find().sort('number')
    for (let i =0; i<allIntro.length; i++) {
      if(allIntro[i].number == req.body.number || allIntro[i].number > req.body.number) {
        
        let newNumber = allIntro[i].number + 1
        await Intro.findByIdAndUpdate(allIntro[i]._id, {number: newNumber})
      }
    }
    const newIntro = new Intro(req.body);
    if(req.file) {
        newIntro.coverPic = req.file.path
    }
    try {
      const savedIntro = await newIntro.save();
        return res.status(200).json(`معرفی با موضوع ${savedIntro.title} ساخته شد`);

    } catch (err) {
      res.status(500).json(err);
    }
  
  });

  //delete intro
router.delete("/:id", async (req, res) => {
  const user = await User.findById(req.body.userId);
  if(user){
    if (user.isAdmin) {
        const intro = await Intro.findById(req.params.id)
        try {
          if(intro){
            fs.unlinkSync("./images/"+ intro.coverPic.slice(7,))
            await Intro.findByIdAndDelete(req.params.id);
            return res.status(200).json("معرفی مورد نظر حذف شد");
          }else {
            return res.status(400).json("معرفی مورد نظر وجود ندارد");
          }
        
        }catch (err) {
          return res.status(500).json(err);
        }
      } else{
        return res.status(403).json("فقط ادمین میتواند معرفی ها را حذف کند");
      }
  }else {
    return res.status(400).json("کاربر وجود ندارد");
  }
});


//update intro
router.put("/:id",verify, upload.single('coverPic'), async (req, res) => {

  const form = new formidable.IncomingForm({
    multiples: true,
    keepExtensions: true,
  });

  form.parse(req);

  const user = await User.findById(req.user.id);
  if (user.isAdmin) {
    try {
      if(form.parse(req).file) {
        const introFile = await Intro.findById(req.params.id)
        fs.unlinkSync("./images/"+ introFile.coverPic.slice(7,))
        introFile.coverPic = form.parse(req).file.path
      }
      
      const intro = await Intro.findByIdAndUpdate(req.params.id, {
        $set: newPost,
      });
      
      res.status(200).json("معرفی مورد نظر به روزرسانی شد");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("فقط ادمین میتواند معرفی ها را بروزرسانی کند");
  }
});


// get all intro
  router.get("/all", async (req, res) => {
    try {
      const allIntros = await Intro.find().sort('number');
      res.status(200).json(allIntros)
    } catch (err) {
      res.status(500).json(err);
    }
  });
  

//get a intro
  router.get("/:id", async (req, res) => {
    try {
      const intro = await Intro.findById(req.params.id);
      res.status(200).json(intro);
    } catch (err) {
      res.status(500).json(err);
    }
  });

module.exports = router;
