import express from "express";
import signUp from "../../controllers/userControllers";

const usersRouter = express.Router();

usersRouter.post("/sign-up", signUp);

export default usersRouter;
