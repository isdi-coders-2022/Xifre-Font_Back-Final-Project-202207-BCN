import { Joi } from "express-validation";

const logInSchema = Joi.object({
  name: Joi.string().min(3).max(15).required(),
  password: Joi.string().required(),
});

export default logInSchema;
