import multer from "multer";
import path from "path";

//? For upload the Image
export const uploadImage = multer({
  storage: multer.diskStorage({}),
  profileImg: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new Error("File type not supported"), false);
      console.log(`cd > ${cb}`);
    }
    cb(null, true);
  },
  limits: { fileSize: 5000000 },
});

//? For upload the CV
export const uploadCV = multer({
  storage: multer.diskStorage({}),
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname)
    console.log("ext = "+ext)
    if (!ext.match(/\.(pdf)$/)) {
      return cb(
        new Error(
          "only upload PDF files format."
        ),
        false
      );
    }
    cb(undefined, true);
  },
  limits: { fileSize: 5000000 }, // max file size is 5MB = 5000000 bytes
});

//? For upload Banner Image
export const uploadBannerImage = multer({
  storage: multer.diskStorage({}),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new Error("File type not supported"), false);
      return;
    }
    cb(null, true);
  },
});
