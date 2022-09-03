import { Joi } from "express-validation";
import ProtoProject from "../controllers/types/projectControllers";

const projectSchema = {
  body: Joi.object<ProtoProject>({
    name: Joi.string().min(2).max(25).required(),
    author: Joi.string().min(3).max(15).required(),
    description: Joi.string().min(10).max(500).required(),
    logo: Joi.string().min(10).max(200).required(),
    repository: Joi.string().min(10).max(200).required(),
    technologies: Joi.array().min(1).max(3).required(),
  }),
};

export default projectSchema;
