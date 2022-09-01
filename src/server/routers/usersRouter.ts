import express from "express";
import { validate } from "express-validation";
import { getUserData, logIn, signUp } from "../../controllers/userControllers";
import logInSchema from "../../schemas/logInSchema";
import signUpSchema from "../../schemas/signUpSchema";

const usersRouter = express.Router();

usersRouter.post(
  "/sign-up",
  validate(signUpSchema, {}, { abortEarly: false }),
  signUp
);
usersRouter.post(
  "/log-in",
  validate(logInSchema, {}, { abortEarly: false }),
  logIn
);

usersRouter.get("/:userId", getUserData);

export default usersRouter;
