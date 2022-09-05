import { NextFunction, Request, Response } from "express";
import codes from "../../configs/codes";
import { Project } from "../../database/models/Project";
import { User } from "../../database/models/User";
import mockProject from "../../test-utils/mocks/mockProject";
import mockUser from "../../test-utils/mocks/mockUser";
import CreateError from "../../utils/CreateError/CreateError";
import validateDeleteRequest from "./validateDeleteRequest";

describe("Given a validateDeleteRequest function", () => {
  const req = {
    params: { projectId: mockProject.id },
    body: {},
  } as Partial<Request>;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;
  const next = jest.fn() as NextFunction;

  describe("When called with a request, a response and a next function as arguments", () => {
    test("Then it should call next", async () => {
      Project.findById = jest.fn().mockReturnValue(mockProject);
      User.findById = jest.fn().mockReturnValue(mockUser);

      await validateDeleteRequest(req as Request, res as Response, next);

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

      await validateDeleteRequest(req as Request, res as Response, next);

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

      await validateDeleteRequest(req as Request, res as Response, next);

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

      await validateDeleteRequest(req as Request, res as Response, next);

      expect(req.body).toStrictEqual(expectedBody);
    });
  });

  describe("If finding a project or a user rejects with an error", () => {
    test("Then it should call next with an error", async () => {
      Project.findById = jest.fn().mockRejectedValue(new Error());
      User.findById = jest.fn().mockReturnValue(null);

      const expectedError = new CreateError(
        codes.notFound,
        "Couldn't delete any project",
        `Project not found: `
      );

      await validateDeleteRequest(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
