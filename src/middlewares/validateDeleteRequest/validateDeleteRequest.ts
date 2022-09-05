import { NextFunction, Request, Response } from "express";
import codes from "../../configs/codes";
import { Project } from "../../database/models/Project";
import { User } from "../../database/models/User";
import IProject from "../../database/types/IProject";
import IUser from "../../database/types/IUser";
import CreateError from "../../utils/CreateError/CreateError";

const validateDeleteRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { projectId } = req.params;

  let deleteFromAuthor = true;
  let authorProjects: string[];
  let authorId: string;

  try {
    const projectToDelete = await Project.findById(projectId);
    const author = await User.findById(projectToDelete.authorId);

    if (!author || !author.projects.includes(projectId)) {
      deleteFromAuthor = false;
    } else {
      authorProjects = author.projects;
      authorId = author.id;
    }
  } catch (error) {
    const newError = new CreateError(
      codes.notFound,
      "Couldn't delete any project",
      `Project not found: ${error.message}`
    );
    next(newError);
    return;
  }

  req.body = {
    deleteFromAuthor,
    authorProjects,
    authorId,
  };
  next();
};

export default validateDeleteRequest;
