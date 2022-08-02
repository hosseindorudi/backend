const mongoose = require("mongoose");

const IntroSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    number:{
        type:Number,
        require:true,
        min:1,
    },
    desc:{
        type:String,
        min:10,
        max:255
    },
    coverPic:{
        type:String,
        require: true,
    },
    job:{
        type:String,
        min:10,
        max:100
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Intro", IntroSchema);