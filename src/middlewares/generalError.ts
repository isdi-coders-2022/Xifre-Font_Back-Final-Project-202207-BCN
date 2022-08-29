import chalk from "chalk";
import Debug from "debug";
import { NextFunction, Request, Response } from "express";
import CreateError from "../utils/CreateError/CreateError";

const debug = Debug("widescope:middlewares:generalError");

const generalError = (
  error: CreateError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const errorCode = error.code ?? 500;
  const errorMessage = error.message ?? "Something went wrong";

  debug(chalk.red(error.privateMessage));

  res.status(errorCode).json({ error: errorMessage });
};

export default generalError;
