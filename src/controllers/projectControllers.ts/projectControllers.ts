import { NextFunction, Request, Response } from "express";
import { Project } from "../../database/models/Project";
import CreateError from "../../utils/CreateError/CreateError";

const getAllProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allProjects = await Project.find({});

    res.status(200).json({ projects: allProjects });
  } catch (error) {
    const newError = new CreateError(404, "No projects found", error.message);
    next(newError);
  }
};

export default getAllProjects;
