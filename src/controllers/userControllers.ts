import "../loadEnvironment";
import { NextFunction, Request, Response } from "express";
import IRegisterData from "./types/userControllers";
import CreateError from "../utils/CreateError/CreateError";
import { hashCreate } from "../utils/auth/auth";
import { User } from "../database/models/User";
import IUser from "../database/types/IUser";

const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const registerData: IRegisterData = req.body;

  if (!registerData.email || !registerData.name || !registerData.password) {
    const newError = new CreateError(
      400,
      "User did not provide email, name or password",
      "User did not provide email, name or password"
    );
    next(newError);
    return;
  }

  let newUser: IUser;

  try {
    registerData.password = await hashCreate(registerData.password);

    newUser = await User.create({
      name: registerData.name.toString(),
      email: registerData.email.toString(),
      password: registerData.password.toString(),
    });

    res.status(200).json({ newUser });
  } catch (error) {
    const newError = new CreateError(
      404,
      error.message,
      "User did not provide email, name or password"
    );
    next(newError);
  }
};

export default signUp;
