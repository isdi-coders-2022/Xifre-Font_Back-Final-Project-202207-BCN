import { NextFunction, Request, Response } from "express";
import fs from "fs/promises";
import codes from "../../configs/codes";
import mockProtoProject from "../../test-utils/mocks/mockProtoProject";
import CreateError from "../../utils/CreateError/CreateError";
import getStringData from "./getStringData";

jest.useFakeTimers();

describe("Given a getStringData function", () => {
  beforeEach(async () => {
    await fs.writeFile("uploads/logo-name.png", "content");
  });

  describe("When called with a request, a response and a next function as arguments", () => {
    const res = {} as Partial<Response>;

    const next = jest.fn() as NextFunction;

    test("Then it should change the content of the body and call next", async () => {
      const req = {
        body: {
          project: JSON.stringify(mockProtoProject),
        },
        file: {
          originalname: "logo-name.png",
          filename: "logo-name.png",
        },
      } as Partial<Request>;

      await getStringData(req as Request, res as Response, next);

      expect(req.body).toStrictEqual({
        ...mockProtoProject,
        logo: `${Date.now()}${req.file.originalname}`,
      });

      expect(next).toHaveBeenCalled();
    });

    test("Then it should call the filesystem rename function, if there is a file", async () => {
      const req = {
        body: {
          project: JSON.stringify(mockProtoProject),
        },
        file: {
          originalname: "logo-name.png",
          filename: "logo-name.png",
        },
      } as Partial<Request>;

      const rename = jest.spyOn(fs, "rename");

      await getStringData(req as Request, res as Response, next);

      expect(rename).toHaveBeenCalled();
    });

    test("Then it should not call the filesystem rename function if there is no file", async () => {
      jest.clearAllMocks();

      const req = {
        body: {
          project: JSON.stringify(mockProtoProject),
        },
      } as Partial<Request>;

      const rename = jest.spyOn(fs, "rename");

      await getStringData(req as Request, res as Response, next);

      expect(rename).not.toHaveBeenCalled();
    });

    test("Then it should call next with an error if something goes wrong while renaming", async () => {
      jest.clearAllMocks();

      const req = {
        body: {
          project: mockProtoProject,
        },
        file: {
          originalname: "logo-name.png",
          filename: "logo-name.png",
        },
      } as Partial<Request>;

      const expectedError = new CreateError(
        codes.badRequest,
        "Invalid data",
        "Something failed while parsing the received data"
      );

      await getStringData(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
