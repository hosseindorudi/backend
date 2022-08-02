const router = require("express").Router();
const Categories = require("../models/Categories");
const Posts = require("../models/Posts");
const User = require("../models/User");
const upload = require("../middleware/upload")
const {verify} = require('./verifyToken')
const fs = require('fs');
const formidable = require("formidable")

// create a post
router.post("/:id/posts", upload.single('coverPic'), async (req, res) => {


    const allPosts = await Posts.find().sort('number')
    for (let i =0; i<allPosts.length; i++) {
      if(allPosts[i].number == req.body.number || allPosts[i].number > req.body.number) {
        
        let newNumber = allPosts[i].number + 1
        await Posts.findByIdAndUpdate(allPosts[i]._id, {number: newNumber})
      }
    }
    const newPost = new Posts(req.body);
    if(req.file) {
      newPost.coverPic = req.file.path
    }
    const categories = await Categories.findById(req.params.id);
    try {
      const savedPost = await newPost.save();
      if (!categories.posts.includes(savedPost.id)) {
        await categories.updateOne({ $push: { posts: savedPost.id } });
        return res.status(200).json(`پست با موضوع ${savedPost.title} ساخته شد`);
        
      } else {
        return res.status(200).json(`پست با این موضوع موجود است`);
      } 
    } catch (err) {
      res.status(500).json(err);
    }
  
  });

  //delete post
router.delete("/:id", async (req, res) => {
  const user = await User.findById(req.body.userId);
  const category = await Categories.findById(req.body.categoryId);
  if (user.isAdmin) {
    const post = await Posts.findById(req.params.id)
    try {
      if(category){
      if(post){
        fs.unlinkSync("./images/"+ post.coverPic.slice(7,))
        await Posts.findByIdAndDelete(req.params.id);
        await category.updateOne({ $pull : {posts: req.params.id}})
        return res.status(200).json("دسته مورد نظر حذف شد");
      }else {
        return res.status(400).json("دسته مورد نظر وجود ندارد");
      }
    } else {
      return res.status(400).json("دسته مورد نظر وجود ندارد");
    }
    }catch (err) {
      return res.status(500).json(err);
    }
  } else{
    return res.status(403).json("فقط ادمین میتواند دسته ها را حذف کند");
  }
});


//update post
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
        const postFile = await Posts.findById(req.params.id)
        fs.unlinkSync("./images/"+ postFile.coverPic.slice(7,))
          postFile.coverPic = form.parse(req).file.path
      }
      
      const post = await Posts.findByIdAndUpdate(req.params.id, {
        $set: newPost,
      });
      
      res.status(200).json("پست مورد نظر به روزرسانی شد");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("فقط ادمین میتواند پست ها را بروزرسانی کند");
  }
});


// get all posts
  router.get("/posts/all", async (req, res) => {
    try {
      const allPosts = await Posts.find().sort('number');
      res.status(200).json(allPosts)
    } catch (err) {
      res.status(500).json(err);
    }
  });
  

//get a post
  router.get("/:id", async (req, res) => {
    try {
      const post = await Posts.findById(req.params.id);
      res.status(200).json(post);
    } catch (err) {
      res.status(500).json(err);
    }
  });


  // get all video from a post
  router.get("/video/all", async (req, res) => {
    try {
      const post = await Posts.findById(req.body.postId);
      const videos = await Promise.all(
        post.videos.map((video) => {
          return Videos.find({ _id : video });
        })
      );
      res.json(videos)
    } catch (err) {
      res.status(500).json(err);
    }
  });

module.exports = router;
