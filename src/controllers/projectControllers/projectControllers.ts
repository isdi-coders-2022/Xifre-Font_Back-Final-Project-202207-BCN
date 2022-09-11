import { NextFunction, Request, Response } from "express";
import codes from "../../configs/codes";
import { Project } from "../../database/models/Project";
import { User } from "../../database/models/User";
import IProject from "../../database/types/IProject";
import IUser from "../../database/types/IUser";
import checkQueries from "../../utils/checkQueries/checkQueries";
import CreateError from "../../utils/CreateError/CreateError";

export const getAllProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { offset, limit, technology } = req.query;

  const query = checkQueries(
    { key: "offset", value: offset as string },
    { key: "limit", value: limit as string },
    { key: "technology", value: technology as string }
  );

  const queries = technology ? { technologies: query[2] } : {};

  try {
    const allProjects = await Project.find(queries)
      .skip(+query[0])
      .limit(+query[1]);

    if (!allProjects.length) {
      res.status(codes.notFound).json({
        projects: "No projects found",
      });
      return;
    }

    res.status(codes.ok).json({
      projects: {
        offset: query[0],
        limit: query[1],
        list: allProjects,
      },
    });
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
    author = await User.findById(finalProject.authorId);

    await User.findByIdAndUpdate(finalProject.authorId, {
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

export const getProjectsByAuthor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  let requestingUser: IUser;

  try {
    requestingUser = await User.findById(userId);
  } catch (error) {
    const newError = new CreateError(
      codes.notFound,
      "Unable to get the requested projects",
      "Requesting user doesn't exist"
    );
    next(newError);
    return;
  }

  try {
    const projects = await Project.find({
      _id: { $in: requestingUser.projects },
    });

    if (!projects.length) {
      res.status(codes.notFound).json({
        projectsByAuthor: {
          author: userId,
          total: "0 projects",
        },
      });
      return;
    }

    res.status(codes.ok).json({
      projectsByAuthor: {
        author: userId,
        total: projects.length,
        projects,
      },
    });
  } catch (error) {
    const newError = new CreateError(
      codes.notFound,
      "Unable to get the requested projects",
      `Could't get any project: ${error.message}`
    );
    next(newError);
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { projectId } = req.params;
  const { deleteFromAuthor, authorProjects, authorId } = req.body;

  try {
    await Project.findByIdAndDelete(projectId);

    if (deleteFromAuthor) {
      const filteredProjects = authorProjects.filter(
        (project: string) => project !== projectId
      );

      await User.findByIdAndUpdate(authorId, {
        projects: filteredProjects,
      });
    }
  } catch (error) {
    const newError = new CreateError(
      codes.notFound,
      "Couldn't delete any project",
      `Error while deleting the project: ${error.message}`
    );
    next(newError);
    return;
  }

  res.status(codes.deletedWithResponse).json({
    projectDeleted: {
      id: projectId,
      status: "Deleted",
    },
  });
};

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const project = req.body as IProject;
  const { projectId } = req.params;

  try {
    const toUpdate = await Project.findById(projectId);

    const setLogo =
      project.logo === "default_logo" ? toUpdate.logo : project.logo;

    const updatedProject = {
      ...project,
      logo: setLogo,
      creationDate: toUpdate.creationDate,
      author: toUpdate.author,
      authorId: toUpdate.authorId,
    };

    await Project.replaceOne({ _id: projectId }, updatedProject);

    res.status(codes.updatedWithResponse).json({ updatedProject });
  } catch (error) {
    const newError = new CreateError(
      codes.badRequest,
      "Couldn't update any project",
      `Error while updating the project: ${error.message}`
    );
    next(newError);
  }
};
