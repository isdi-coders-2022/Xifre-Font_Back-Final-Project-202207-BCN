import { NextFunction, Request, Response } from "express";
import { readFile } from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import environment from "../../configs/environment";
import CreateError from "../../utils/CreateError/CreateError";
import codes from "../../configs/codes";

const supabase = createClient(
  environment.supabase.url,
  environment.supabase.key
);

const supabaseUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { logo } = req.body;

  if (!logo || logo === "default_logo.png") {
    next();
    return;
  }

  const imagePath = path.join("uploads", logo);
  const resolvedPath = path.resolve(imagePath);

  try {
    const fileData = await readFile(resolvedPath);
    const compressedFileData = await readFile(
      path.join("uploads", `r_${logo}`)
    );

    const storage = supabase.storage.from(environment.supabase.bucket);

    const uploadResult = await storage.upload(logo, fileData);
    await storage.upload(`r_${logo}`, compressedFileData);

    if (uploadResult.error) {
      next(uploadResult.error);
      return;
    }

    const { publicURL } = storage.getPublicUrl(logo);

    req.body.logoBackup = publicURL;
    next();
  } catch (error) {
    const newError = new CreateError(
      codes.internalServerError,
      "Couldn't upload or read the image",
      "Error while reading and uploading the image"
    );
    next(newError);
  }
};

export default supabaseUpload;
