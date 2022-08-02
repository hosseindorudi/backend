const mongoose = require("mongoose");

const PostsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    coverPic:{
        type:String,
        require: true,
    },
    videos:{
        type:Array,
        default:[]
    },
    number:{
      type:Number,
      require:true,
      min:1,
  },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Posts", PostsSchema);
