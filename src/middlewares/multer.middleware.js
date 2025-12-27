//here we make the middleware using the multer
// because where i found that i want to do file uploading at that place i inject the middleware 
//middleware have to configure

import multer from "multer"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage })