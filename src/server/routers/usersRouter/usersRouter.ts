import express from "express";
import { validate } from "express-validation";
import { endpoints } from "../../../configs/routes";
import {
  addFriend,
  getUserData,
  logIn,
  signUp,
} from "../../../controllers/userControllers/userControllers";
import { authentication } from "../../../middlewares/authentication/authentication";
import logInSchema from "../../../schemas/logInSchema";
import signUpSchema from "../../../schemas/signUpSchema";

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

usersRouter.patch(endpoints.addFriend, authentication, addFriend);

export default usersRouter;
