import { NextFunction, Request, Response } from "express";
import mockProject from "../../test-utils/mocks/mockProject";
import mockProtoProject from "../../test-utils/mocks/mockProtoProject";
import getStringData from "./getStringData";

describe("Given a getStringData function", () => {
  describe("When called with a request, a response and a next function as arguments", () => {
    const req = {
      body: {
        project: JSON.stringify(mockProtoProject),
      },
      file: {
        filename: mockProject.logo,
      },
    } as Partial<Request>;

    const res = {} as Partial<Response>;

    const next = jest.fn() as NextFunction;

    test("Then it should change the content of the body and call next", async () => {
      await getStringData(req as Request, res as Response, next);

      expect(req.body).toStrictEqual({
        ...mockProtoProject,
        logo: `uploads\\${req.file.filename}`,
      });

      expect(next).toHaveBeenCalled();
    });
  });
});
