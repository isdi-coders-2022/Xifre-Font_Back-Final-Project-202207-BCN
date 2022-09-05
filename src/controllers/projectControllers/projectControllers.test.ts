import { NextFunction, Request, Response } from "express";
import codes from "../../configs/codes";
import { Project } from "../../database/models/Project";
import { User } from "../../database/models/User";
import mockProject from "../../test-utils/mocks/mockProject";
import mockUser from "../../test-utils/mocks/mockUser";
import CreateError from "../../utils/CreateError/CreateError";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getById,
  getProjectsByAuthor,
} from "./projectControllers";

describe("Given a getAllProjects function", () => {
  const req = {} as Partial<Request>;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;
  const next = jest.fn() as NextFunction;
  Project.find = jest.fn().mockReturnValue([mockProject]);

  describe("When called with a request, a response and a next function", () => {
    test(`Then it should respond with a status of '${codes.ok}'`, async () => {
      await getAllProjects(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(codes.ok);
    });

    test(`Then it should respond with all the projects found`, async () => {
      const expectedResponse = {
        projects: [mockProject],
      };
      await getAllProjects(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });
  });

  describe("When called but the database doesn't return any valid data", () => {
    test("Then it should call next with an error", async () => {
      Project.find = jest.fn().mockRejectedValue(new Error());

      const expectedError = new CreateError(
        codes.notFound,
        "No projects found",
        "Error while getting projects: "
      );

      await getAllProjects(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = (next as jest.Mock<any, any>).mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });

  describe("When called but there are no projects avaliable", () => {
    test(`Then it should respond informing that there are no projects with code '${codes.notFound}'`, async () => {
      Project.find = jest.fn().mockReturnValue([]);

      const expectedResponse = {
        projects: "No projects found",
      };

      await getAllProjects(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(codes.notFound);
      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });
  });
});

describe("Given a getById function", () => {
  const req = {
    params: {
      projectId: "#",
    },
  } as Partial<Request>;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn() as NextFunction;

  describe("When called with a request, a response and a next function", () => {
    test(`Then it should respond with a status of '${codes.ok}' and the project found`, async () => {
      Project.findById = jest.fn().mockReturnValue(mockProject);

      const expectedResponse = {
        project: mockProject,
      };

      await getById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(codes.ok);
      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });

    test("Then it should respond with a not found code if no projects were found", async () => {
      Project.findById = jest.fn().mockReturnValue(null);

      const expectedResponse = {
        projects: "No projects found",
      };

      await getById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(codes.notFound);
      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });
  });

  describe("When called but the database find fails", () => {
    test("Then it should call next with an error", async () => {
      Project.findById = jest.fn().mockRejectedValue(new Error());

      const expectedError = new CreateError(
        codes.notFound,
        "No projects found",
        "Error while finding the project requested"
      );

      await getById(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = (next as jest.Mock<any, any>).mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });
});

describe("Given a createProject function", () => {
  const req = {
    body: mockProject,
  } as Partial<Request>;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;
  const next = jest.fn() as NextFunction;

  Project.create = jest.fn().mockReturnValue(mockProject);
  Project.findByIdAndDelete = jest.fn();

  User.findById = jest
    .fn()
    .mockReturnValue({ id: mockUser.id, projects: mockUser.projects });
  User.findByIdAndUpdate = jest.fn();

  describe("When called with a request, a response and a next function", () => {
    Project.create = jest.fn().mockReturnValue(mockProject);
    User.findById = jest
      .fn()
      .mockReturnValue({ id: mockUser.id, projects: mockUser.projects });
    User.findByIdAndUpdate = jest.fn();
    Project.findByIdAndDelete = jest.fn();

    test(`Then it should respond with a status of '${codes.created}'`, async () => {
      await createProject(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(codes.created);
    });

    test(`Then it should respond with the project created`, async () => {
      const expectedResponse = {
        projectCreated: mockProject,
      };

      await createProject(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });

    test("Then it should modify the author document to add a new project", async () => {
      await createProject(req as Request, res as Response, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(mockUser.id, {
        projects: [...mockUser.projects, mockProject.id],
      });
    });
  });

  describe("When called but the project creation fails", () => {
    test("Then it should call next with an error", async () => {
      Project.create = jest.fn().mockRejectedValue(new Error());

      const expectedError = new CreateError(
        codes.badRequest,
        "Unable to create the project",
        "Unable to create the project: "
      );
      await createProject(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = (next as jest.Mock<any, any>).mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });

  describe("When called but the author doesn't exist", () => {
    test("Then it should delete the project created", async () => {
      jest.clearAllMocks();

      Project.create = jest.fn().mockReturnValue(mockProject);
      User.findById = jest.fn().mockRejectedValue(new Error());

      await createProject(req as Request, res as Response, next);

      expect(Project.findByIdAndDelete).toHaveBeenCalledWith(mockProject.id);
    });

    test("Then it should call next wiht a not found error", async () => {
      jest.clearAllMocks();

      Project.create = jest.fn().mockReturnValue(mockProject);
      User.findById = jest.fn().mockRejectedValue(new Error());

      await createProject(req as Request, res as Response, next);

      const expectedError = new CreateError(
        codes.notFound,
        "Couldn't assign an author to the project",
        "The author doesn't exist"
      );

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = (next as jest.Mock<any, any>).mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });
});

describe("Given a getProjectsByAuthor function", () => {
  const req = {
    params: { userId: mockUser.id },
  } as Partial<Request>;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;
  const next = jest.fn() as NextFunction;

  describe("When called with a request, a response and a next function as arguments", () => {
    test(`Then it should call status with a status of ${codes.ok}`, async () => {
      Project.find = jest.fn().mockReturnValue(mockUser.projects);

      User.findById = jest
        .fn()
        .mockReturnValue({ id: mockUser.id, projects: mockUser.projects });

      await getProjectsByAuthor(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(codes.ok);
    });

    test("Then it should call json with a list of projects and extra information", async () => {
      Project.find = jest.fn().mockReturnValue(mockUser.projects);

      User.findById = jest
        .fn()
        .mockReturnValue({ id: mockUser.id, projects: mockUser.projects });

      const expectedResponse = {
        projectsByAuthor: {
          author: mockUser.id,
          total: mockUser.projects.length,
          projects: mockUser.projects,
        },
      };

      await getProjectsByAuthor(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });
  });

  describe("When the user requesting does'nt exist", () => {
    test(`It should call next with a ${codes.notFound} error`, async () => {
      User.findById = jest.fn().mockRejectedValue(new Error());

      const expectedError = new CreateError(
        codes.notFound,
        "Unable to get the requested projects",
        "Requesting user doesn't exist"
      );

      await getProjectsByAuthor(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = (next as jest.Mock<any, any>).mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });

  describe("When the user requesting has no projects", () => {
    test(`Then it should respond informing that there are no projects with a status of '${codes.notFound}'`, async () => {
      Project.find = jest.fn().mockReturnValue([]);

      User.findById = jest.fn().mockReturnValue({
        id: mockUser.id,
        projects: 0,
      });

      const expectedResponse = {
        projectsByAuthor: {
          author: mockUser.id,
          total: "0 projects",
        },
      };

      await getProjectsByAuthor(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(expectedResponse);
      expect(res.status).toHaveBeenCalledWith(codes.notFound);
    });
  });

  describe("When it's not possible to get any project from the user", () => {
    test(`Then it should call next with a ${codes.notFound} error`, async () => {
      jest.clearAllMocks();

      User.findById = jest.fn().mockReturnValue({
        id: mockUser.id,
        projects: mockUser.projects,
      });
      Project.find = jest.fn().mockRejectedValue(new Error());

      const expectedError = new CreateError(
        codes.notFound,
        "Unable to get the requested projects",
        `Could't get any project: `
      );

      await getProjectsByAuthor(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = (next as jest.Mock<any, any>).mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });
});

describe("Given a projectControllers function", () => {
  const req = {
    params: { projectId: mockProject.id },
    body: {
      deleteFromAuthor: true,
      authorProjects: [mockProject],
      authorId: mockProject.authorId,
    },
  } as Partial<Request>;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;
  const next = jest.fn() as NextFunction;

  Project.findByIdAndDelete = jest.fn();

  User.findByIdAndUpdate = jest.fn();

  describe("When called with a request, a response and a next function as arguments", () => {
    test(`Then it should call status with a status of '${codes.deletedWithResponse}'`, async () => {
      await deleteProject(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(codes.deletedWithResponse);
    });

    test("Then it should respond with a success message", async () => {
      await deleteProject(req as Request, res as Response, next);

      const expectedResponse = {
        projectDeleted: {
          id: mockProject.id,
          status: "Deleted",
        },
      };

      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });
  });
});
