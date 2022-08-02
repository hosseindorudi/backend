const router = require("express").Router();
const Baner = require("../models/Baner");
const User = require("../models/User");
const upload = require("../middleware/upload")
const {verify} = require('./verifyToken')
const fs = require('fs');
const formidable = require("formidable")

// create a baner
router.post("/", upload.single('coverPic'), async (req, res) => {


    const allBaner = await Baner.find().sort('number')
    for (let i =0; i<allBaner.length; i++) {
      if(allBaner[i].number == req.body.number || allBaner[i].number > req.body.number) {
        
        let newNumber = allBaner[i].number + 1
        await Baner.findByIdAndUpdate(allBaner[i]._id, {number: newNumber})
      }
    }
    const newBaner = new Baner(req.body);
    if(req.file) {
        newBaner.coverPic = req.file.path
    }
    try {
      const savedBaner = await newBaner.save();
        return res.status(200).json(`بنر با موضوع ${savedBaner.title} ساخته شد`);

    } catch (err) {
      res.status(500).json(err);
    }
  
  });

  //delete baner
router.delete("/:id", async (req, res) => {
  const user = await User.findById(req.body.userId);
  if(user){
    if (user.isAdmin) {
        const baner = await Baner.findById(req.params.id)
        try {
          if(baner){
            console.log("asdasd")
            fs.unlinkSync("./images/"+ baner.coverPic.slice(7,))
            await Baner.findByIdAndDelete(req.params.id);
            return res.status(200).json("بنر مورد نظر حذف شد");
          }else {
            return res.status(400).json("بنر مورد نظر وجود ندارد");
          }
        
        }catch (err) {
          return res.status(500).json(err);
        }
      } else{
        return res.status(403).json("فقط ادمین میتواند بنر ها را حذف کند");
      }
  }else {
    return res.status(400).json("کاربر وجود ندارد");
  }
});


//update baner
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
        const banerFile = await Baner.findById(req.params.id)
        fs.unlinkSync("./images/"+ banerFile.coverPic.slice(7,))
        banerFile.coverPic = form.parse(req).file.path
      }
      
      const baner = await Baner.findByIdAndUpdate(req.params.id, {
        $set: newPost,
      });
      
      res.status(200).json("بنر مورد نظر به روزرسانی شد");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("فقط ادمین میتواند بنر ها را بروزرسانی کند");
  }
});


// get all baner
  router.get("/all", async (req, res) => {
    try {
      const allBaners = await Baner.find().sort('number');
      res.status(200).json(allBaners)
    } catch (err) {
      res.status(500).json(err);
    }
  });
  

//get a baner
  router.get("/:id", async (req, res) => {
    try {
      const baner = await Baner.findById(req.params.id);
      res.status(200).json(baner);
    } catch (err) {
      res.status(500).json(err);
    }
  });

module.exports = router;
