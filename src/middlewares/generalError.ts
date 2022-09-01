import chalk from "chalk";
import Debug from "debug";
import { NextFunction, Request, Response } from "express";
import { ValidationError } from "express-validation";
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
    errorCode = 400;
    errorMessage = "Bad request";

    debug(chalk.red("Bad request:"));

    error.details.body.forEach((errorInfo) => {
      debug(chalk.yellowBright(errorInfo.message));
    });
  } else {
    errorCode = (error as CreateError).code ?? 500;
    errorMessage = error.message ?? "Something went wrong";

    debug(chalk.red((error as CreateError).privateMessage));
  }

  res.status(errorCode).json({ error: errorMessage });
};

export default generalError;
