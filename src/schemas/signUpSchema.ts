import { Joi } from "express-validation";

const signUpSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(15).required(),
    password: Joi.string().required(),
    email: Joi.string().min(10).max(25).required(),
  }),
};

export default signUpSchema;
