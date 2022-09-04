import { NextFunction, Request, Response } from "express";

const getStringData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const newProject = req.body.project;

  const curatedProject = await JSON.parse(newProject);

  curatedProject.logo = `uploads\\${req.file.filename}`;

  req.body = curatedProject;

  next();
};

export default getStringData;
