import express from "express";
import { validate } from "express-validation";
import multer from "multer";
import { endpoints } from "../../../configs/routes";
import {
  createProject,
  getAllProjects,
  getById,
  getProjectsByAuthor,
} from "../../../controllers/projectControllers/projectControllers";
import { authentication } from "../../../middlewares/authentication/authentication";
import getStringData from "../../../middlewares/getStringData/getStringData";
import projectSchema from "../../../schemas/projectSchema";

const projectsRouter = express.Router();

const upload = multer({
  dest: "public/uploads",
  limits: { fileSize: 3000000 },
});

projectsRouter.get(endpoints.allProjects, getAllProjects);
projectsRouter.get(endpoints.projectById, getById);
projectsRouter.get(endpoints.projectsByAuthor, getProjectsByAuthor);
projectsRouter.post(
  endpoints.createProject,
  authentication,
  upload.single("logo"),
  getStringData,
  validate(projectSchema, {}, { abortEarly: false }),
  createProject
);

export default projectsRouter;
