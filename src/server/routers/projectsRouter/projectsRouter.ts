import express from "express";
import { validate } from "express-validation";
import { endpoints } from "../../../configs/routes";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getById,
  getProjectsByAuthor,
  updateProject,
} from "../../../controllers/projectControllers/projectControllers";
import { authentication } from "../../../middlewares/authentication/authentication";
import supabaseUpload from "../../../middlewares/supabaseUpload/supabaseUpload";
import getStringData from "../../../middlewares/getStringData/getStringData";
import validateDeleteRequest from "../../../middlewares/validateDeleteRequest/validateDeleteRequest";
import projectSchema from "../../../schemas/projectSchema";
import { upload } from "../../../utils/multer/multer";
import compressImage from "../../../middlewares/compressImage/compressImage";
import validateId from "../../../middlewares/validateId/validateId";

const projectsRouter = express.Router();

projectsRouter.get(endpoints.allProjects, getAllProjects);
projectsRouter.get(endpoints.projectById, getById);
projectsRouter.get(endpoints.projectsByAuthor, getProjectsByAuthor);

projectsRouter.post(
  endpoints.createProject,
  authentication,
  upload.single("logo"),
  getStringData,
  compressImage,
  supabaseUpload,
  validate(projectSchema, {}, { abortEarly: false }),
  createProject
);

projectsRouter.delete(
  endpoints.deleteProject,
  authentication,
  validateDeleteRequest,
  deleteProject
);

projectsRouter.put(
  endpoints.updateProject,
  authentication,
  upload.single("logo_update"),
  getStringData,
  validateId,
  compressImage,
  supabaseUpload,
  validate(projectSchema, {}, { abortEarly: false }),
  updateProject
);

export default projectsRouter;
