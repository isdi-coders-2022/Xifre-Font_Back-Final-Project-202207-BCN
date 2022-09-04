import express from "express";
import { validate } from "express-validation";
import multer from "multer";
import { endpoints } from "../../../configs/routes";
import {
  createProject,
  getAllProjects,
  getById,
} from "../../../controllers/projectControllers.ts/projectControllers";
import projectSchema from "../../../schemas/projectSchema";

const projectsRouter = express.Router();

const upload = multer({ dest: "uploads", limits: { fileSize: 3000000 } });

projectsRouter.get(endpoints.getAllProjects, getAllProjects);
projectsRouter.get(endpoints.projectById, getById);
projectsRouter.post(
  endpoints.createProject,
  upload.single("logo"),
  // validate(projectSchema, {}, { abortEarly: false }),
  createProject
);

export default projectsRouter;
