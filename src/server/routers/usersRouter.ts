import express from "express";
import { logIn, signUp } from "../../controllers/userControllers";

const usersRouter = express.Router();

usersRouter.post("/sign-up", signUp);
usersRouter.post("/log-in", logIn);

export default usersRouter;
