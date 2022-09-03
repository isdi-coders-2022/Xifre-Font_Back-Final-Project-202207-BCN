import express from "express";
import { validate } from "express-validation";
import { endpoints } from "../../../configs/routes";
import {
  createProject,
  getAllProjects,
  getById,
} from "../../../controllers/projectControllers.ts/projectControllers";
import projectSchema from "../../../schemas/projectSchema";

const projectsRouter = express.Router();

projectsRouter.get(endpoints.getAllProjects, getAllProjects);
projectsRouter.get(endpoints.projectById, getById);
projectsRouter.post(
  endpoints.createProject,
  validate(projectSchema, {}, { abortEarly: false }),
  createProject
);

export default projectsRouter;
