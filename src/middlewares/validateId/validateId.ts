import { NextFunction, Response } from "express";
import codes from "../../configs/codes";
import IProject from "../../database/types/IProject";
import CreateError from "../../utils/CreateError/CreateError";
import { CustomRequest } from "../authentication/authentication";

const validateId = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const project = req.body as IProject;

  if (project.authorId !== req.payload.id) {
    const newError = new CreateError(
      codes.badRequest,
      "Could't update the project",
      "The client is not the author of the project"
    );
    next(newError);
    return;
  }

  next();
};

export default validateId;
