import { Joi } from "express-validation";

const projectSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(25).required(),
    author: Joi.string().min(3).max(15).required(),
    authorId: Joi.string(),
    description: Joi.string().min(10).max(500).required(),
    logo: Joi.string().min(10).max(200).required(),
    logoBackup: Joi.string(),
    repository: Joi.string().min(10).max(200).required(),
    technologies: Joi.array().min(1).max(3).required(),
  }),
};

export default projectSchema;
