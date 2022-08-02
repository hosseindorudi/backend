const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const categoriesRoute = require("./routes/categories");
const postsRoute = require("./routes/posts");
const videosRoute = require("./routes/video");
const banerRoute = require("./routes/baner");
const introRoute = require("./routes/intro");
const path = require("path")
dotenv.config();
const cors=require("cors");
mongoose.connect(
  process.env.MONGO_URL,
  () => {
    console.log("Connected to MongoDB");
  }
);

const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}

//middleware
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")))



app.use(cors(corsOptions)) // Use this after the variable declaration


app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/categories", categoriesRoute);
app.use("/api/posts", postsRoute);
app.use("/api/videos", videosRoute);
app.use("/api/baners", banerRoute);
app.use("/api/intros", introRoute);


app.disable('etag')

app.listen(5000, () => {
    console.log("backend server is running")
})