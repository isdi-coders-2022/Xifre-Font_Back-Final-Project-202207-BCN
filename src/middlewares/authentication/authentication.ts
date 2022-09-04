import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import codes from "../../configs/codes";
import { verifyToken } from "../../utils/auth/auth";
import CreateError from "../../utils/CreateError/CreateError";

export interface CustomRequest extends Request {
  payload: JwtPayload;
}

const authentication = (
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

  const tokenData = verifyToken(token);

  if (typeof tokenData === "string") {
    const newError = new CreateError(
      codes.internalServerError,
      "Authentication error",
      "Invalid token"
    );
    next(newError);
    return;
  }

  req.payload = tokenData;
  next();
};
export default authentication;
