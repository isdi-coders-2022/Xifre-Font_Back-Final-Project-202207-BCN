import express from "express";
import { getUserData, logIn, signUp } from "../../controllers/userControllers";

const usersRouter = express.Router();

usersRouter.post("/sign-up", signUp);
usersRouter.post("/log-in", logIn);

usersRouter.get("/:userId", getUserData);

export default usersRouter;
