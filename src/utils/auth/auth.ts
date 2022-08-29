import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Payload from "../../types/Payload";

export const hashCreate = (password: string): Promise<string> => {
  const salt = 10;
  return bcrypt.hash(password, salt);
};

export const createToken = (payload: Payload): string =>
  jwt.sign(payload, process.env.AUTH_SECRET || "temporal_fix");
