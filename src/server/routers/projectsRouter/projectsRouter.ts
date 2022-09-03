import express from "express";
import { endpoints } from "../../../configs/routes";
import {
  getAllProjects,
  getById,
} from "../../../controllers/projectControllers.ts/projectControllers";

const projectsRouter = express.Router();

projectsRouter.get(endpoints.getAllProjects, getAllProjects);
projectsRouter.get(endpoints.projectById, getById);

export default projectsRouter;
