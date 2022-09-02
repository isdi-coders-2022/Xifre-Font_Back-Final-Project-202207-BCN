import express from "express";
import { endpoints } from "../../../configs/routes";
import getAllProjects from "../../../controllers/projectControllers.ts/projectControllers";

const projectsRouter = express.Router();

projectsRouter.get(endpoints.getAllProjects, getAllProjects);

export default projectsRouter;
