import { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import codes from "../../configs/codes";
import CreateError from "../../utils/CreateError/CreateError";

const getStringData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    body: { project },
    file,
  } = req;
  try {
    const curatedProject = await JSON.parse(project);

    const newLogoName = file
      ? `${Date.now()}${file.originalname}`
      : "default_logo";

    if (file) {
      await fs.rename(
        path.join("uploads", file.filename),
        path.join("uploads", newLogoName)
      );
    }

    curatedProject.logo = newLogoName;
    req.body = curatedProject;

    next();
  } catch (error) {
    const newError = new CreateError(
      codes.badRequest,
      "Invalid data",
      "Something failed while parsing the received data"
    );
    next(newError);
  }
};

export default getStringData;
