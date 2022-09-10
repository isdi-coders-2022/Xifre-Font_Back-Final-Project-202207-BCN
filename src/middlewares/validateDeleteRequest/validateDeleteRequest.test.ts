import { NextFunction, Request, Response } from "express";
import codes from "../../configs/codes";
import { Project } from "../../database/models/Project";
import { User } from "../../database/models/User";
import mockProject from "../../test-utils/mocks/mockProject";
import mockUser from "../../test-utils/mocks/mockUser";
import CreateError from "../../utils/CreateError/CreateError";
import { CustomRequest } from "../authentication/authentication";
import validateDeleteRequest from "./validateDeleteRequest";

describe("Given a validateDeleteRequest function", () => {
  const req = {
    params: { projectId: mockProject.id },
    payload: { id: mockUser.id },
    body: {},
  } as Partial<Request>;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;
  const next = jest.fn();

  describe("When called with a request, a response and a next function as arguments", () => {
    test("Then it should call next", async () => {
      Project.findById = jest.fn().mockReturnValue(mockProject);
      User.findById = jest.fn().mockReturnValue(mockUser);

      await validateDeleteRequest(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalled();
    });

    test("Then it should set the req.body with the data required by the delete controller", async () => {
      Project.findById = jest.fn().mockReturnValue(mockProject);
      User.findById = jest.fn().mockReturnValue(mockUser);

      const expectedBody = {
        deleteFromAuthor: true,
        authorProjects: mockUser.projects,
        authorId: mockUser.id,
      };

      await validateDeleteRequest(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(req.body).toStrictEqual(expectedBody);
    });
  });

  describe("When called but the project author doesn't have the requested project", () => {
    test("Then it should set the request for not deleting the author", async () => {
      Project.findById = jest.fn().mockReturnValue(mockProject);
      User.findById = jest.fn().mockReturnValue({ ...mockUser, projects: [] });

      const expectedBody = {
        deleteFromAuthor: false,
        authorProjects: undefined as undefined,
        authorId: undefined as undefined,
      };

      await validateDeleteRequest(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(req.body).toStrictEqual(expectedBody);
    });
  });

  describe("When called but the project author does not exist", () => {
    test("Then it should set the request for not deleting the author", async () => {
      Project.findById = jest.fn().mockReturnValue(mockProject);
      User.findById = jest.fn().mockReturnValue(null);

      const expectedBody = {
        deleteFromAuthor: false,
        authorProjects: undefined as undefined,
        authorId: undefined as undefined,
      };

      await validateDeleteRequest(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(req.body).toStrictEqual(expectedBody);
    });
  });

  describe("If finding a project or a user rejects with an error", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("Then it should call next with an error", async () => {
      Project.findById = jest.fn().mockRejectedValue(new Error());
      User.findById = jest.fn().mockReturnValue(null);

      const expectedError = new CreateError(
        codes.notFound,
        "Project or user not found",
        "Project not found: "
      );

      await validateDeleteRequest(
        req as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = next.mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });

  describe("If the user requesting the delete and the project author don't match", () => {
    test("Then it should call next with an error", async () => {
      Project.findById = jest.fn().mockReturnValue(mockProject);
      User.findById = jest.fn().mockReturnValue({ ...mockUser, projects: [] });

      const reqWithPayload = {
        params: { projectId: mockProject.id },
        payload: { id: "" },
        body: {},
      } as Partial<Request>;

      const expectedError = new CreateError(
        codes.badRequest,
        "Couldn't delete any project",
        "The requesting user is not the author of the project"
      );

      await validateDeleteRequest(
        reqWithPayload as CustomRequest,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = next.mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });
});
