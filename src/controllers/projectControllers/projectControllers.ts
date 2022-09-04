import { NextFunction, Request, Response } from "express";
import codes from "../../configs/codes";
import { Project } from "../../database/models/Project";
import { User } from "../../database/models/User";
import IProject from "../../database/types/IProject";
import IUser from "../../database/types/IUser";
import CreateError from "../../utils/CreateError/CreateError";

export const getAllProjects = async (
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

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { projectId } = req.params;

  try {
    const dbProject = await Project.findById(projectId);

    if (!dbProject) {
      res.status(codes.notFound).json({ projects: "No projects found" });
      return;
    }

    res.status(codes.ok).json({ project: dbProject });
  } catch (error) {
    const newError = new CreateError(
      codes.notFound,
      "No projects found",
      "Error while finding the project requested"
    );

    next(newError);
  }
};

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let finalProject: IProject;
  let author: IUser;

  const { authorId } = req.body;
  delete req.body.authorId;

  try {
    finalProject = await Project.create(req.body);
  } catch (error) {
    const newError = new CreateError(
      codes.badRequest,
      "Unable to create the project",
      `Unable to create the project: ${error.message}`
    );
    next(newError);
    return;
  }

  try {
    author = await User.findById(authorId);

    await User.findByIdAndUpdate(author.id, {
      projects: [...author.projects, finalProject.id],
    });
  } catch (error) {
    const newError = new CreateError(
      codes.notFound,
      "Couldn't assign an author to the project",
      "The author doesn't exist"
    );

    Project.findByIdAndDelete(finalProject.id);

    next(newError);
    return;
  }

  res.status(codes.created).json({ projectCreated: finalProject });
};
