import "../loadEnvironment";
import { NextFunction, Request, Response } from "express";
import { IRegisterData, ILoginData } from "./types/userControllers";
import CreateError from "../utils/CreateError/CreateError";
import { hashCompare, hashCreate } from "../utils/auth/auth";
import { User } from "../database/models/User";
import IUser from "../database/types/IUser";
import prepareToken from "../utils/prepareToken/prepareToken";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const logIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginRequest: ILoginData = req.body;

  let dbUser: IUser[];

  try {
    dbUser = await User.find({ name: loginRequest.name });

    if (!dbUser.length) {
      throw new Error();
    }
  } catch (error) {
    const newError = new CreateError(
      404,
      "Invalid username or password",
      "User not found"
    );
    next(newError);
    return;
  }

  try {
    const isPasswordCorrect = await hashCompare(
      loginRequest.password,
      dbUser[0].password
    );

    if (!isPasswordCorrect) {
      throw new Error();
    }
  } catch (error) {
    const newError = new CreateError(
      404,
      "User or password not valid",
      "Invalid password"
    );
    next(newError);
    return;
  }

  res.status(200).json(prepareToken(dbUser[0]));
};
