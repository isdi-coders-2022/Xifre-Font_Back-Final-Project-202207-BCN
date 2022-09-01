import chalk from "chalk";
import Debug from "debug";
import { NextFunction, Request, Response } from "express";
import { ValidationError } from "express-validation";
import CreateError from "../utils/CreateError/CreateError";

const debug = Debug("widescope:middlewares:generalError");

const generalError = (
  error: CreateError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  let errorCode = error.code ?? 500;
  let errorMessage = error.message ?? "Something went wrong";

  if (error instanceof ValidationError) {
    errorCode = 400;
    errorMessage = "Bad request";

    debug(chalk.red("Bad request:"));

    error.details.body.forEach((errorInfo) => {
      debug(chalk.yellowBright(errorInfo.message));
    });
  }

  debug(chalk.red(error.privateMessage));

  res.status(errorCode).json({ error: errorMessage });
};

export default generalError;
