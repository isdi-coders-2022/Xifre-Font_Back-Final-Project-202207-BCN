import chalk from "chalk";
import Debug from "debug";
import { NextFunction, Request, Response } from "express";
import { ValidationError } from "express-validation";
import codes from "../configs/codes";
import CreateError from "../utils/CreateError/CreateError";

const debug = Debug("widescope:middlewares:generalError");

const generalError = (
  error: CreateError | ValidationError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  let errorCode: number;
  let errorMessage: string;

  if (error instanceof ValidationError) {
    errorCode = codes.badRequest;
    errorMessage = "Bad request";

    debug(chalk.red("Bad request:"));

    error.details.body.forEach((errorInfo) => {
      debug(chalk.yellowBright(errorInfo.message));
    });
  } else {
    errorCode = error.code ?? codes.internalServerError;
    errorMessage = error.message ?? "Something went wrong";

    debug(chalk.red(error.privateMessage));
  }

  res.status(errorCode).json({ error: errorMessage });
};

export default generalError;
