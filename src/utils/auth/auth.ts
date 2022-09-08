import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import environment from "../../configs/environment";
import Payload from "../../types/Payload";

export const hashCreate = (password: string): Promise<string> => {
  const salt = 10;
  return bcrypt.hash(password, salt);
};

export const createToken = (payload: Payload): string =>
  jwt.sign(payload, environment.secret);

export const hashCompare = (
  dataToCompare: string,
  hash: string
): Promise<boolean> => bcrypt.compare(dataToCompare, hash);

export const verifyToken = (token: string): string | JwtPayload =>
  jwt.verify(token, environment.secret);
