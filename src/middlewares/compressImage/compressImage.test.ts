import { NextFunction, Request, Response } from "express";
import fs from "fs";
import codes from "../../configs/codes";
import CreateError from "../../utils/CreateError/CreateError";
import compressImage from "./compressImage";

const mockToFile = jest.fn();

const mockToFormat = jest.fn().mockReturnValue({
  toFile: mockToFile,
});

const mockJpeg = jest.fn().mockReturnValue({
  toFormat: mockToFormat,
});

let mockResize = jest.fn().mockReturnValue({
  jpeg: mockJpeg,
});

jest.mock("sharp", () => () => ({
  resize: mockResize,
}));

beforeAll(async () => {
  await fs.writeFile("public/uploads/logo-name.png", "content", () => {});
});

afterAll(async () => {
  await fs.unlink("public/uploads/logo-name.png", () => {});
  await fs.unlink("public/uploads/r_logo-name.png", () => {});
});

describe("Given a compressImage function", () => {
  const req = {
    body: {
      logo: "logo-name.png",
    },
  } as Partial<Request>;
  const res = {} as Partial<Response>;
  const next = jest.fn();

  describe("When called with a request, a response and a next function", () => {
    test("Then it should resize and compress the received image", async () => {
      await compressImage(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(mockResize).toHaveBeenCalled();
      expect(mockJpeg).toHaveBeenCalled();
      expect(mockToFormat).toHaveBeenCalled();
      expect(mockToFile).toHaveBeenCalled();
    });

    test("Then it should call next to continue to the next middleware", async () => {
      await compressImage(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalled();
    });

    test("Then it should call next with an error if something goes wrong", async () => {
      jest.clearAllMocks();
      jest.restoreAllMocks();

      mockResize = jest.fn().mockReturnValue({
        jpeg: jest.fn().mockReturnValue({
          toFile: jest.fn().mockRejectedValue(new Error()),
        }),
      });

      const expectedError = new CreateError(
        codes.internalServerError,
        "Couldn't compress the image",
        "Couldn't compress the image"
      );

      await compressImage(
        req as Request,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalledWith(expectedError);

      const nextCalled = next.mock.calls[0][0];

      expect(nextCalled.privateMessage).toBe(expectedError.privateMessage);
    });
  });

  describe("When called with a request that has no logo", () => {
    test("Then it should not compress anything and call next", async () => {
      jest.clearAllMocks();
      jest.restoreAllMocks();

      const reqNoLogo = {
        body: {},
      } as Partial<Request>;

      await compressImage(
        reqNoLogo as Request,
        res as Response,
        next as NextFunction
      );

      expect(mockResize).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });
});
