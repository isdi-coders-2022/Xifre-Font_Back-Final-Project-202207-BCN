import { NextFunction, Request, Response } from "express";
import { User } from "../database/models/User";
import mockUser from "../test-utils/mocks/mockUser";
import CreateError from "../utils/CreateError/CreateError";
import { signUp } from "./userControllers";

jest.mock("../utils/auth/auth", () => ({
  ...jest.requireActual("../utils/auth/auth"),
  hashCreate: () => jest.fn().mockReturnValue("#"),
  createToken: () => jest.fn().mockReturnValue("#"),
}));

describe("Given a signUp function (controller)", () => {
  const status = 200;

  const req = {
    body: mockUser,
  } as Partial<Request>;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn() as NextFunction;

  User.create = jest.fn().mockReturnValue(mockUser);

  describe("When called with a request, a response and a next function as arguments", () => {
    test("It should call status with a code of 200", async () => {
      await signUp(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status);
    });

    test("It should respond with a new user as a body", async () => {
      const expectedBody = {
        newUser: mockUser,
      };

      await signUp(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(expectedBody);
    });

    test("It should respond with an error if something goes wrong when hashing the password or creating", async () => {
      const errorMessage = "Error message";
      User.create = jest.fn().mockRejectedValue(new Error(errorMessage));

      const expectedError = new CreateError(
        400,
        errorMessage,
        "User did not provide email, name or password"
      );

      await signUp(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });

    test("It should respond with an error if the request did not provide a valid user", async () => {
      const invalidReq = {
        body: "",
      } as Partial<Request>;

      const expectedError = new CreateError(
        400,
        "User did not provide email, name or password",
        "User did not provide email, name or password"
      );

      await signUp(invalidReq as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
