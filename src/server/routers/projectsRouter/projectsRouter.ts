import express from "express";
import { validate } from "express-validation";
import multer from "multer";
import { endpoints } from "../../../configs/routes";
import {
  createProject,
  getAllProjects,
  getById,
} from "../../../controllers/projectControllers/projectControllers";
import getStringData from "../../../middlewares/getStringData/getStringData";
import projectSchema from "../../../schemas/projectSchema";

const projectsRouter = express.Router();

const upload = multer({
  dest: "public/uploads",
  limits: { fileSize: 3000000 },
});

projectsRouter.get(endpoints.getAllProjects, getAllProjects);
projectsRouter.get(endpoints.projectById, getById);
projectsRouter.post(
  endpoints.createProject,
  upload.single("logo"),
  getStringData,
  validate(projectSchema, {}, { abortEarly: false }),
  createProject
);

export default projectsRouter;
