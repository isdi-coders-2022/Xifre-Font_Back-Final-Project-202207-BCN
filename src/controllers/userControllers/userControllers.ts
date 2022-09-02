import "../../loadEnvironment";
import { NextFunction, Request, Response } from "express";
import CreateError from "../../utils/CreateError/CreateError";
import { hashCompare, hashCreate } from "../../utils/auth/auth";
import { User } from "../../database/models/User";
import IUser from "../../database/types/IUser";
import prepareToken from "../../utils/prepareToken/prepareToken";
import codes from "../../configs/codes";
import { ILoginData, IRegisterData } from "../types/userControllers";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const registerData: IRegisterData = req.body;

  try {
    registerData.password = await hashCreate(registerData.password);

    const checkUser = await User.find({
      name: registerData.name,
    });

    if (checkUser.length > 0) {
      const newError = new CreateError(
        codes.conflict,
        "User did not provide email, name or password",
        "User already exists"
      );

      next(newError);
      return;
    }

    const newUser = await User.create({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
    });

    res.status(codes.created).json({ newUser });
  } catch (error) {
    const newError = new CreateError(
      codes.badRequest,
      "User did not provide email, name or password",
      error.message
    );
    next(newError);
  }
};

export const logIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginData: ILoginData = req.body;

  let dbUser: IUser[];

  try {
    dbUser = await User.find({
      name: loginData.name,
    });

    if (!dbUser.length) {
      throw new Error();
    }
  } catch (error) {
    const newError = new CreateError(
      codes.notFound,
      "Invalid username or password",
      "User not found"
    );
    next(newError);
    return;
  }

  try {
    const isPasswordCorrect = await hashCompare(
      loginData.password,
      dbUser[0].password
    );

    if (!isPasswordCorrect) {
      throw new Error();
    }
  } catch (error) {
    const newError = new CreateError(
      codes.badRequest,
      "Invalid username or password",
      "Invalid password"
    );

    next(newError);
    return;
  }

  res.status(codes.ok).json(prepareToken(dbUser[0]));
};

export const getUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  let dbUser: IUser;

  try {
    dbUser = await User.findById(userId);

    res.status(codes.ok).json({ user: dbUser });
  } catch (error) {
    const newError = new CreateError(
      codes.notFound,
      "Bad request",
      `Requested user does not exist`
    );

    next(newError);
  }
};
