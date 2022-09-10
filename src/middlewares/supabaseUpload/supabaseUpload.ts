import { NextFunction, Request, Response } from "express";
import { readFile } from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import environment from "../../configs/environment";
import CreateError from "../../utils/CreateError/CreateError";
import codes from "../../configs/codes";

const supabase = createClient(
  environment.supabase.url ?? "https://jmgqlfqskmlmzzxxcjhv.supabase.co",
  environment.supabase.key ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZ3FsZnF1a21sbXp6eHhjamh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjI3MjAxMzgsImV4cCI6MTk3ODI5NjEzOH0.Jnt1Wd2Bh3BefXrq5_pMSCAdLVBUl21cyIB57x_qJyA"
);

const supabaseUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { logo } = req.body;

  if (!logo || logo === "default_logo") {
    next();
    return;
  }

  const imagePath = path.join("public", "uploads", `r_${logo}`);
  const resolvedPath = path.resolve(imagePath);

  try {
    const fileData = await readFile(resolvedPath);

    const storage = supabase.storage.from(environment.supabase.bucket);

    const uploadResult = await storage.upload(logo, fileData);

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
