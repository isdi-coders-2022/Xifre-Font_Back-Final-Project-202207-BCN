import { NextFunction, Request, Response } from "express";
import codes from "../../configs/codes";
import { Project } from "../../database/models/Project";
import CreateError from "../../utils/CreateError/CreateError";

const getAllProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allProjects = await Project.find({});

    if (!allProjects.length) {
      res.status(codes.notFound).json({ projects: "No projects found" });
      return;
    }

    res.status(codes.ok).json({ projects: allProjects });
  } catch (error) {
    const newError = new CreateError(
      codes.notFound,
      "No projects found",
      `Error while getting projects: ${error.message}`
    );
    next(newError);
  }
};

export default getAllProjects;
