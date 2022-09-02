import express from "express";
import { endpoints } from "../../../configs/routes";

const projectsRouter = express.Router();

projectsRouter.get(endpoints.getAllProjects);

export default projectsRouter;
