import { NextFunction, Response } from "express";
import codes from "../../configs/codes";
import { Project } from "../../database/models/Project";
import { User } from "../../database/models/User";
import CreateError from "../../utils/CreateError/CreateError";
import { CustomRequest } from "../authentication/authentication";

const validateDeleteRequest = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { id: requestingUserId } = req.payload;
  const { projectId } = req.params;

  let deleteFromAuthor = true;
  let authorProjects: string[];
  let authorId: string;

  try {
    const projectToDelete = await Project.findById(projectId);

    if (projectToDelete.authorId !== requestingUserId) {
      const newError = new CreateError(
        codes.badRequest,
        "Couldn't delete any project",
        "The requesting user is not the author of the project"
      );
      next(newError);
      return;
    }

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
      "Project or user not found",
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
