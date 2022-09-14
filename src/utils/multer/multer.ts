import multer from "multer";
import path from "path";

const maxFileSize = 5 * 1024 * 1024;

export const multerFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void => {
  if (file.fieldname === "logoUpdate" && !file.originalname) {
    callback(null, false);
    return;
  }

  callback(null, true);
};

export const upload = multer({
  dest: path.join("uploads"),
  limits: { fileSize: maxFileSize },
  fileFilter: multerFilter,
});
