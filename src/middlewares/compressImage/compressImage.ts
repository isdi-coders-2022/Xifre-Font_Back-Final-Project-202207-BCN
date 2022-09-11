import { NextFunction, Request, Response } from "express";
import path from "path";
import sharp from "sharp";
import codes from "../../configs/codes";
import IProject from "../../database/types/IProject";
import CreateError from "../../utils/CreateError/CreateError";

const compressImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { logo } = req.body as IProject;

  if (!logo || logo === "default_logo") {
    next();
    return;
  }

  try {
    await sharp(path.join("public", "uploads", `${logo}`))
      .resize(250, 250, { withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toFile(path.join("public", "uploads", `r_${logo}`));
    next();
  } catch (error) {
    const newError = new CreateError(
      codes.internalServerError,
      "Couldn't compress the image",
      "Couldn't compress the image"
    );
    next(newError);
  }
};

export default compressImage;
