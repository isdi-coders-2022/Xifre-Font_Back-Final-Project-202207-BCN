import { NextFunction, Request, Response } from "express";
import codes from "../../configs/codes";
import { User } from "../../database/models/User";
import { CustomRequest } from "../../middlewares/authentication/authentication";
import mockUser from "../../test-utils/mocks/mockUser";
import CreateError from "../../utils/CreateError/CreateError";
import prepareToken from "../../utils/prepareToken/prepareToken";
import {
  addFriend,
  getAllUsers,
  getUserData,
  logIn,
  signUp,
} from "./userControllers";

let mockHashCompareValue: boolean | jest.Mock<boolean> = true;

jest.mock("../../utils/auth/auth", () => ({
  ...jest.requireActual("../../utils/auth/auth"),
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

  const next = jest.fn();

  User.create = jest.fn().mockReturnValue(mockUser);

  describe("When called with a request, a response and a next function as arguments", () => {
    test(`It should call status with a code of '${codes.created}'`, async () => {
      User.find = jest.fn().mockReturnValue([]);
      await signUp(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(codes.created);
    });

    test("It should respond with a new user as a body", async () => {
      User.find = jest.fn().mockReturnValue([]);
      const expectedBody = {
        newUser: mockUser,
      };

      await signUp(req as Request, res as Response, next as NextFunction);

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

      await signUp(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = next.mock.calls[0][0];
      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });

    test("It should respond with an error if the user already exists", async () => {
      User.find = jest.fn().mockReturnValue([mockUser]);

      const expectedError = new CreateError(
        codes.conflict,
        "User did not provide email, name or password",
        "User already exists"
      );

      await signUp(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = next.mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
      expect(nextCalled.code).toBe(codes.conflict);
    });
  });
});

describe("Given a log in function (controller)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockLoginData = {
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

  const next = jest.fn();

  User.find = jest.fn().mockReturnValue([mockUser]);

  describe("When called with a request, a response and a next function as arguments", () => {
    test(`It should call status with a code of ${codes.ok}`, async () => {
      mockHashCompareValue = jest.fn().mockReturnValue(true);

      await logIn(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(codes.ok);
    });

    test("It should prepare a token with the logged in user", async () => {
      mockHashCompareValue = jest.fn().mockReturnValue(true);

      await logIn(req as Request, res as Response, next as NextFunction);

      expect(res.json).toHaveBeenCalledWith(prepareToken(mockUser));
    });

    test("If no users are found, it should call next with an error", async () => {
      User.find = jest.fn().mockReturnValue([]);

      await logIn(req as Request, res as Response, next as NextFunction);

      const expectedError = new CreateError(
        codes.notFound,
        "Invalid username or password",
        "User not found"
      );

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = next.mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });

    test("If the password is wrong, it should call next with an error", async () => {
      User.find = jest.fn().mockReturnValue([mockUser]);
      mockHashCompareValue = false;

      await logIn(req as Request, res as Response, next as NextFunction);

      const expectedError = new CreateError(
        codes.badRequest,
        "Invalid username or password",
        "Invalid password"
      );

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = next.mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });
});

describe("Given a getUserData controller", () => {
  const req = {
    params: { userId: "#" },
    query: { friends: "" },
  } as Partial<Request>;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn();
  User.findById = jest.fn().mockReturnValue(mockUser);
  User.find = jest.fn().mockReturnValue([mockUser]);

  describe("When called with a request, a response and a next function as arguments", () => {
    test(`It should call status with a code of ${codes.ok}`, async () => {
      await getUserData(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(codes.ok);
    });

    test("It should respond with a new user as a body", async () => {
      const expectedBody = {
        user: mockUser,
      };

      await getUserData(req as Request, res as Response, next as NextFunction);

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

      await getUserData(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = next.mock.calls[0][0];
      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });

  describe("When called requesting all the user friends", () => {
    test(`Then it should respond with a status of '${codes.ok}' and with a list of the friends found`, async () => {
      User.findById = jest.fn().mockReturnValue(mockUser);

      const expectedBody = {
        userFriends: [{ ...mockUser }],
      };

      const reqWithQuery = {
        params: { userId: "#" },
        query: { friends: "all" },
      } as Partial<Request>;

      await getUserData(
        reqWithQuery as Request,
        res as Response,
        next as NextFunction
      );

      expect(res.status).toHaveBeenCalledWith(codes.ok);
      expect(res.json).toHaveBeenCalledWith(expectedBody);
    });
  });
});

describe("Given a addFriend function (controller)", () => {
  describe("When called with a request, a response and a next function as arguments", () => {
    test(`It should call status with a code of '${codes.ok}'`, async () => {
      const req = {
        payload: { id: mockUser.id, name: "" },
        params: { friendId: mockUser.id },
      } as Partial<CustomRequest>;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response>;

      const next = jest.fn();

      User.findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({ ...mockUser, contacts: [] });
      User.findById = jest.fn().mockReturnValue({ ...mockUser, contacts: [] });

      await addFriend(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(res.status).toHaveBeenCalledWith(codes.ok);
    });

    test("It should respond informing that the friend was added", async () => {
      const req = {
        payload: { id: mockUser.id },
        params: { friendId: mockUser.id },
      } as Partial<Request>;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response>;

      const next = jest.fn();

      User.findByIdAndUpdate = jest.fn().mockReturnValue(mockUser);
      User.findById = jest.fn().mockReturnValue(mockUser);

      const expectedResponse = { friendAdded: mockUser.name };

      await addFriend(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });
  });

  describe("When called but it was not possible to find the requested user", () => {
    test("Then it should call next with an error", async () => {
      User.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error());

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response>;

      const customReq = {
        payload: { id: mockUser.id },
        params: { friendId: mockUser.id },
      } as Partial<Request>;

      const expectedError = new CreateError(
        codes.notFound,
        "Bad request",
        "Error while adding friend: "
      );
      const nextError = jest.fn();

      await addFriend(
        customReq as CustomRequest,
        res as Response,
        nextError as NextFunction
      );

      expect(nextError).toHaveBeenCalledWith(expectedError);

      const nextErrorCalled = nextError.mock.calls[0][0];

      expect(nextErrorCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });

  describe("When called but the requesting user already had the requested friend", () => {
    test("Then it should call next with an error", async () => {
      User.findByIdAndUpdate = jest.fn().mockReturnValue(mockUser);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as Partial<Response>;

      const reqWithSameId = {
        payload: { id: mockUser.id },
        params: { friendId: mockUser.contacts[0] },
      } as Partial<Request>;
      const nextWithSameId = jest.fn();

      const expectedError = new CreateError(
        codes.notFound,
        "Bad request",
        "Error while adding friend: Requested friend is already a contact"
      );

      await addFriend(
        reqWithSameId as CustomRequest,
        res as Response,
        nextWithSameId as NextFunction
      );

      expect(nextWithSameId).toHaveBeenCalledWith(expectedError);

      const nextWithSameIdCalled = nextWithSameId.mock.calls[0][0];

      expect(nextWithSameIdCalled.privateMessage).toBe(
        expectedError.privateMessage
      );
    });
  });
});

describe("Given a getAllUsers function (controller)", () => {
  const req = {
    query: { username: "" },
  } as Partial<Request>;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn();

  User.find = jest.fn().mockReturnValue([mockUser]);

  describe("When called with a request, a response and a next function as arguments", () => {
    test(`It should call status with a code of '${codes.ok}'`, async () => {
      await getAllUsers(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(codes.ok);
    });

    test("It should respond with all the users received", async () => {
      await getAllUsers(req as Request, res as Response, next as NextFunction);

      expect(res.json).toHaveBeenCalledWith({ users: [mockUser] });
    });
  });

  describe("When called but no users at found", () => {
    test("Then it should call next with an error", async () => {
      const expectedError = new CreateError(
        codes.notFound,
        "No users found",
        "No users found"
      );

      User.find = jest.fn().mockReturnValue([]);

      await getAllUsers(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = next.mock.calls[0][0];
      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });

  describe("When called but there's an error while getting the users", () => {
    test("Then it should call next with an error", async () => {
      const expectedError = new CreateError(
        codes.notFound,
        "No users found",
        "No users found"
      );

      User.find = jest.fn().mockRejectedValue(new Error());

      await getAllUsers(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = next.mock.calls[0][0];
      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });

  describe("When called requesting a specific user", () => {
    test("Then it should find by the requested params", async () => {
      const customReq = {
        query: { username: mockUser.name },
      } as Partial<Request>;

      User.find = jest.fn().mockReturnValue([mockUser]);

      await getAllUsers(
        customReq as Request,
        res as Response,
        next as NextFunction
      );

      expect(User.find).toHaveBeenCalledWith({ name: mockUser.name });
    });
  });
});
