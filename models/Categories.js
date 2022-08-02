const mongoose = require("mongoose");

const CategoriesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
      unique: true,
    },
    posts:{
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

module.exports = mongoose.model("Categories", CategoriesSchema);
