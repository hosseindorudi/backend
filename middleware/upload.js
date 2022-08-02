const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "images/");
    },
    filename: (req, file, cb) => {
        let ext = path.extname(file.originalname)
      cb(null, Date.now() + ext );
    },
  });


  var upload = multer({
    storage:storage,
    fileFilter: function(req,file,callback) {
        if(
            file.mimetype == "image/PNG" ||
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg" ||
            file.mimetype == "image/JPEG" ||
            file.mimetype == "image/JPG"
        ) {
            callback(null, true)
        }else {
            console.log('only jpg & png file supported!')
            callback(null, false)
        }
    },
    limits: {
        fileSize : 1024 * 1024 * 2
    }
  })

  module.exports = upload