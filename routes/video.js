const router = require("express").Router();
const Videos = require("../models/Videos");
const Posts = require("../models/Posts");
const User = require("../models/User");
const {verify} = require('./verifyToken')
const upload = require("../middleware/upload")


// create a video
router.post("/:id/videos",verify,upload.single('coverPic'), async (req, res) => {

  const existVideo = await Videos.find({title: req.body.title})

  if(existVideo.length !== 0) {
    return res.status(200).json(`ویدئو با این موضوع موجود است`)
  }else {
    const allVideos = await Videos.find().sort('number')
    for (let i =0; i<allVideos.length; i++) {
      if(allVideos[i].number == req.body.number || allVideos[i].number > req.body.number) {
        
        let newNumber = allVideos[i].number + 1
        await Videos.findByIdAndUpdate(allVideos[i]._id, {number: newNumber})
      }
    }
    const newVideo = new Videos(req.body);
    if(req.file) {
      newVideo.coverPic = req.file.path
    }
    const posts = await Posts.findById(req.params.id);
    try {
      const savedVideo = await newVideo.save();
      if (!posts.videos.includes(savedVideo.id)) {
        await posts.updateOne({ $push: { videos: savedVideo.id } });
        return res.status(200).json(`ویدئو با موضوع ${savedVideo.title} ساخته شد`);
      } else {
        return res.status(200).json(`ویدئو با این موضوع موجود است`);
        
      } 
    } catch (err) {
      res.status(500).json(err);
    }
  }
  });

//delete video
router.delete("/:id",verify, async (req, res) => {
  const user = await User.findById(req.body.userId);
  const post = await Posts.findById(req.body.postId);
  if (user.isAdmin) {
    const video = await Videos.findById(req.params.id)
    try {
      if(post) {
    if(video){
      fs.unlinkSync("./images/"+ video.coverPic.slice(7,))
      await Videos.findByIdAndDelete(req.params.id);
      await post.updateOne({ $pull : {videos: req.params.id}})
      return res.status(200).json("وبدئو مورد نظر حذف شد");
    }else {
      return res.status(400).json("وبدئو مورد نظر وجود ندارد");
    }
  }else {
    return res.status(400).json("پست مورد نظر وجود ندارد");
  }
  }catch (err) {
    return res.status(500).json(err);
  }
  } else {
    return res.status(403).json("فقط ادمین میتواند ویدئو ها را حذف کند");
  }
});


//update video
router.put("/:id",verify, async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (user.isAdmin) {
    try {
      const video = await Videos.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("ویدئو مورد نظر به روزرسانی شد");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("فقط ادمین میتواند ویدئو ها را بروزرسانی کند");
  }
});

// get all videos
  router.get("/videos/all",verify, async (req, res) => {
    try {
      const allVideos = await Videos.find();
      res.status(200).json(allVideos)
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  
  
//get a video
  router.get("/:id",verify, async (req, res) => {
    try {
      const video = await Videos.findById(req.params.id);
      res.status(200).json(video);
    } catch (err) {
      res.status(500).json(err);
    }
  });



module.exports = router;
