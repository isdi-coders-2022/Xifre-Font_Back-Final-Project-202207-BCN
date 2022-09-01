import express from "express";
import { validate } from "express-validation";
import { endpoints } from "../../configs/routes";
import { getUserData, logIn, signUp } from "../../controllers/userControllers";
import logInSchema from "../../schemas/logInSchema";
import signUpSchema from "../../schemas/signUpSchema";

const usersRouter = express.Router();

usersRouter.post(
  endpoints.signUp,
  validate(signUpSchema, {}, { abortEarly: false }),
  signUp
);
usersRouter.post(
  endpoints.logIn,
  validate(logInSchema, {}, { abortEarly: false }),
  logIn
);

usersRouter.get(endpoints.getUserData, getUserData);

export default usersRouter;
