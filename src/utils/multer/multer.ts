import multer from "multer";
import path from "path";

export const multerFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void => {
  if (file.fieldname === "logo_update" && !file.filename) {
    callback(null, false);
    return;
  }

  callback(null, true);
};

export const upload = multer({
  dest: path.join("public", "uploads"),
  limits: { fileSize: 5242880000 },
  fileFilter: multerFilter,
});
