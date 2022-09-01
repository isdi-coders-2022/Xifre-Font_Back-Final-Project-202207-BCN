import { NextFunction, Request, Response } from "express";
import codes from "../configs/codes";
import { User } from "../database/models/User";
import mockUser from "../test-utils/mocks/mockUser";
import CreateError from "../utils/CreateError/CreateError";
import prepareToken from "../utils/prepareToken/prepareToken";
import { getUserData, logIn, signUp } from "./userControllers";

let mockHashCompareValue: any = true;

jest.mock("../utils/auth/auth", () => ({
  ...jest.requireActual("../utils/auth/auth"),
  hashCreate: () => jest.fn().mockReturnValue("#"),
  createToken: () => "#",
  hashCompare: () => mockHashCompareValue,
}));

describe("Given a signUp function (controller)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const { name, password, email } = mockUser;

  const req = {
    body: { name, password, email },
  } as Partial<Request>;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn() as NextFunction;

  User.create = jest.fn().mockReturnValue(mockUser);

  describe("When called with a request, a response and a next function as arguments", () => {
    test(`It should call status with a code of '${codes.created}'`, async () => {
      User.find = jest.fn().mockReturnValue([]);
      await signUp(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(codes.created);
    });

    test("It should respond with a new user as a body", async () => {
      User.find = jest.fn().mockReturnValue([]);
      const expectedBody = {
        newUser: mockUser,
      };

      await signUp(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(expectedBody);
    });

    test("It should respond with an error if something goes wrong when hashing the password or creating", async () => {
      const errorMessage = "Error message";

      User.create = jest.fn().mockRejectedValue(new Error(errorMessage));
      User.find = jest.fn().mockReturnValue([]);

      const expectedError = new CreateError(
        codes.badRequest,
        "User did not provide email, name or password",
        errorMessage
      );

      await signUp(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = (next as jest.Mock<any, any>).mock.calls[0][0];
      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });

    test("It should respond with an error if the user already exists", async () => {
      User.find = jest.fn().mockReturnValue([mockUser]);

      const expectedError = new CreateError(
        codes.badRequest,
        "User did not provide email, name or password",
        "User already exists"
      );

      await signUp(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = (next as jest.Mock<any, any>).mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
      expect(nextCalled.code).toBe(codes.conflict);
    });
  });
});

describe("Given a log in function (controller)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockLoginData: any = {
    name: mockUser.name,
    password: mockUser.password,
  };

  const req = {
    body: mockLoginData,
  } as Partial<Request>;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn() as NextFunction;

  User.find = jest.fn().mockReturnValue([mockUser]);

  describe("When called with a request, a response and a next function as arguments", () => {
    test("It should call status with a code of 200", async () => {
      mockHashCompareValue = jest.fn().mockReturnValue(true);

      await logIn(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(codes.ok);
    });

    test("It should prepare a token with the logged in user", async () => {
      mockHashCompareValue = jest.fn().mockReturnValue(true);

      await logIn(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(prepareToken(mockUser));
    });

    test("If no users are found, it should call next with an error", async () => {
      User.find = jest.fn().mockReturnValue([]);

      await logIn(req as Request, res as Response, next);

      const expectedError = new CreateError(
        codes.notFound,
        "Invalid username or password",
        "User not found"
      );

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = (next as jest.Mock<any, any>).mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });

    test("If the password is wrong, it should call next with an error", async () => {
      User.find = jest.fn().mockReturnValue([mockUser]);
      mockHashCompareValue = false;

      await logIn(req as Request, res as Response, next);

      const expectedError = new CreateError(
        codes.badRequest,
        "Invalid username or password",
        "Invalid password"
      );

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = (next as jest.Mock<any, any>).mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });
});

describe("Given a getUserData controller", () => {
  const req = {
    params: { userId: "#" },
  } as Partial<Request>;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn() as NextFunction;
  User.findById = jest.fn().mockReturnValue(mockUser);

  describe("When called with a request, a response and a next function as arguments", () => {
    test(`It should call status with a code of ${codes.ok}`, async () => {
      await getUserData(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(codes.ok);
    });

    test("It should respond with a new user as a body", async () => {
      const expectedBody = {
        user: mockUser,
      };

      await getUserData(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(expectedBody);
    });
  });

  describe("When the user is not found", () => {
    test("It should call next with an error", async () => {
      User.findById = jest.fn().mockRejectedValue(new Error());
      const expectedError = new CreateError(
        404,
        "Bad request",
        `Requested user does not exist`
      );

      await getUserData(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = (next as jest.Mock<any, any>).mock.calls[0][0];
      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });
});
