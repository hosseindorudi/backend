const mongoose = require("mongoose");

const VideosSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    coverPic:{
      type:String,
      require: true,
  },
    link: {
      type: String,
      require: true,
    },
    number:{
      type:Number,
      require:true,
      min:1,
  },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Videos", VideosSchema);
