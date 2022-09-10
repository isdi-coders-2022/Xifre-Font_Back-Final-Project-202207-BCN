import { NextFunction, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import codes from "../../configs/codes";
import mockUser from "../../test-utils/mocks/mockUser";
import Payload from "../../types/Payload";
import CreateError from "../../utils/CreateError/CreateError";
import { authentication, CustomRequest } from "./authentication";

let mockJwtPayload: (token: string) => void | jest.Mock = jest
  .fn()
  .mockReturnValue({
    id: mockUser.id,
    name: mockUser.name,
    iat: 1516239022,
  } as JwtPayload);

jest.mock("../../utils/auth/auth", () => ({
  ...jest.requireActual("../../utils/auth/auth"),
  verifyToken: (token: string) => mockJwtPayload(token),
}));

describe("Given a authentication function", () => {
  const req = {
    get: jest.fn().mockReturnValue("Bearer #"),
    payload: {} as Payload,
  } as Partial<CustomRequest>;

  const res = {
    status: jest.fn(),
    json: jest.fn().mockReturnThis(),
  } as Partial<Response>;

  const next = jest.fn();

  describe("When called with req, res and next as arguments", () => {
    test("Then it should call the next function", () => {
      jest.clearAllMocks();

      authentication(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalled();

      const nextCalled = next.mock.calls[0][0];
      expect(nextCalled).toBeUndefined();
    });

    test("If the token doesn't start with bearer, it should call next with an error", () => {
      jest.clearAllMocks();

      const expectedError = new CreateError(
        codes.internalServerError,
        "Authentication error",
        "Bad request"
      );

      req.get = jest.fn().mockReturnValue("#");

      authentication(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = next.mock.calls[0][0];
      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });

    test("If the token is empty, it should call next with an error", () => {
      const expectedError = new CreateError(
        codes.internalServerError,
        "Authentication error",
        "Bad request"
      );

      authentication(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = next.mock.calls[0][0];
      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });

    test("It should call the verify token function with a token", () => {
      jest.restoreAllMocks();
      jest.clearAllMocks();

      req.get = jest.fn().mockReturnValue("Bearer #");

      authentication(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(mockJwtPayload).toHaveBeenCalledWith("#");
    });
  });

  describe("When called but the token is not valid and verification return a string", () => {
    test("It should call next with an error", () => {
      jest.clearAllMocks();

      const mockReq = {
        get: jest.fn().mockReturnValue("Bearer #"),
        payload: {} as Payload,
      } as Partial<CustomRequest>;

      const expectedError = new CreateError(
        codes.internalServerError,
        "Authentication error",
        "Invalid token"
      );

      mockJwtPayload = () => {
        throw new Error();
      };

      authentication(
        mockReq as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = next.mock.calls[0][0];
      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });
});
