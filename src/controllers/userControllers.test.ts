import { NextFunction, Request, Response } from "express";
import { User } from "../database/models/User";
import logInSchema from "../schemas/logInSchema";
import signUpSchema from "../schemas/signUpSchema";
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

const mockJoiValidationError = (schema: "signUp" | "logIn" = "signUp"): any => {
  switch (schema) {
    case "signUp":
      return signUpSchema.validate(
        {},
        {
          abortEarly: false,
        }
      );
      break;

    case "logIn":
      return logInSchema.validate(
        {},
        {
          abortEarly: false,
        }
      );
      break;
    default:
      return {};
      break;
  }
};

describe("Given a signUp function (controller)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const { name, password, email } = mockUser;
  const status = 200;

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
        "User did not provide email, name or password",
        errorMessage
      );

      await signUp(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = (next as jest.Mock<any, any>).mock.calls[0][0];
      expect(nextCalled.privateMessage).toBe(errorMessage);
    });

    test("It should respond with an error if the request did not provide a valid user", async () => {
      const invalidReq = {
        body: {},
      } as Partial<Request>;

      const expectedError = new CreateError(
        404,
        "User did not provide email, name or password",
        Object.values(mockJoiValidationError("signUp").error.message).join("")
      );

      await signUp(invalidReq as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);
      const nextCalled = (next as jest.Mock<any, any>).mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(
        Object.values(mockJoiValidationError("signUp").error.message).join("")
      );
    });
  });
});

describe("Given a log in function (controller)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const status = 200;

  let mockLoginData: any = {
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

      expect(res.status).toHaveBeenCalledWith(status);
    });

    test("It should prepare a token with the logged in user", async () => {
      mockHashCompareValue = jest.fn().mockReturnValue(true);

      await logIn(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(prepareToken(mockUser));
    });

    test("If the login data is not valid, it should call next with an error", async () => {
      mockLoginData = {};

      const emptyReq = {
        body: mockLoginData,
      } as Partial<Request>;

      await logIn(emptyReq as Request, res as Response, next);
      const expectedError = new CreateError(
        400,
        "Invalid username or password",
        Object.values(mockJoiValidationError().error.message).join("")
      );

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = (next as jest.Mock<any, any>).mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(
        Object.values(mockJoiValidationError("logIn").error.message).join("")
      );
    });

    test("If no users are found, it should call next with an error", async () => {
      User.find = jest.fn().mockReturnValue([]);

      await logIn(req as Request, res as Response, next);

      const expectedError = new CreateError(
        404,
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
        400,
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
  const status = 200;

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
    test("It should call status with a code of 200", async () => {
      await getUserData(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status);
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
    });
  });
});
