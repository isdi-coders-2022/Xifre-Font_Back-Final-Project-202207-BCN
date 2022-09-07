import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import codes from "../../configs/codes";
import Payload from "../../types/Payload";
import { verifyToken } from "../../utils/auth/auth";
import CreateError from "../../utils/CreateError/CreateError";

export interface CustomRequest extends Request {
  payload: Payload;
}

export const authentication = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const dataAuthentication = req.get("Authorization");

  if (!dataAuthentication || !dataAuthentication.startsWith("Bearer")) {
    const newError = new CreateError(
      codes.internalServerError,
      "Authentication error",
      "Bad request"
    );
    next(newError);
    return;
  }

  const token = dataAuthentication.slice(7);
  let tokenData: string | JwtPayload;

  try {
    tokenData = verifyToken(token);
  } catch (error) {
    const newError = new CreateError(
      codes.internalServerError,
      "Authentication error",
      "Invalid token"
    );
    next(newError);
    return;
  }

  req.payload = tokenData as Payload;
  next();
};
