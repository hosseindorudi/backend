const router = require("express").Router();
const Categories = require("../models/Categories");
const User = require("../models/User");
const {verify} = require('./verifyToken')
const Posts = require("../models/Posts");

//create a categories
router.post("/", async (req, res) => {
  const findCategory = await Categories.findOne({title:req.body.title})
  if(findCategory) {
    return res.status(409).json("دسته با این نام موجود است");
  }else {
    const allCategories = await Categories.find().sort('number')
    for (let i =0; i<allCategories.length; i++) {
      if(allCategories[i].number == req.body.number || allCategories[i].number > req.body.number) {
        
        let newNumber = allCategories[i].number + 1
        await Categories.findByIdAndUpdate(allCategories[i]._id, {number: newNumber})
      }
  }
}
  const newCategory = new Categories(req.body);
  try {
    const savedCategory = await newCategory.save();
    res.status(200).json(`دسته با نام ${savedCategory.title} ساخته شد`);
  } catch (err) {
    res.status(500).json(err);
  }
}
);

//delete category
router.delete("/:id",verify,  async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (user.isAdmin) {
    try {
      await Categories.findByIdAndDelete(req.params.id);
      res.status(200).json("دسته مورد نظر حذف شد");
    }catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("فقط ادمین میتواند دسته ها را حذف کند");
  }
});


//update category
router.put("/:id",verify,  async (req, res) => {
  
  const user = await User.findById(req.body.userId);
  if (user.isAdmin) {
    try {
      const category = await Categories.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("دسته مورد نظر به روزرسانی شد");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("فقط ادمین میتواند دسته ها را بروزرسانی کند");
  }
});


// get all categories
router.get("/categories/all",  async (req, res) => {
  try {
    const allCategories = await Categories.find();
    res.status(200).json(allCategories)
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a category
router.get("/:id",  async (req, res) => {
  try {
    const category = await Categories.findById(req.params.id);
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json(err);
  }
});


// get all posts from a category
router.get("/post/all/:id", async (req, res) => {
  
  try {
    const category = await Categories.findById(req.params.id);
    const catPosts = await Promise.all(
      category.posts.map((post) => {
        return Posts.find({ _id : post });
      })
    );
    res.status(200).json(catPosts)
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
