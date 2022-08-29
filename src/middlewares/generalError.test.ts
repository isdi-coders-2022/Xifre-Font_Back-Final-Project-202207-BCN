import { NextFunction, Request, Response } from "express";
import CreateError from "../utils/CreateError";
import generalError from "./generalError";

describe("Given a generalError function (middleware)", () => {
  const req = {} as Partial<Request>;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn() as NextFunction;
  describe("When called with a custom error (with undefined parameters), a request and a response as arguments", () => {
    test("Then it should call res.status with a default status of '500'", () => {
      const expectedStatus = 500;
      const customError = new CreateError(undefined, undefined, undefined);

      generalError(customError, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
    });

    test("Then it should call json with a generic error message of 'Something went wrong'", () => {
      const expectedMessage = "Something went wrong";
      const expectedResponse = { error: expectedMessage };
      const customError = new CreateError(undefined, undefined, undefined);

      generalError(customError, req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });
  });

  describe("When called with a custom error with a code of 400", () => {
    test("Then it should call res.status with a default status of '400'", () => {
      const status = 500;
      const customError = new CreateError(status, undefined, undefined);

      generalError(customError, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(status);
    });
  });

  describe("When called with a custom error with a public message 'Public error'", () => {
    test("Then it should call res.json with said error message", () => {
      const errorMessage = "Public error";
      const expectedResponse = { error: errorMessage };
      const customError = new CreateError(undefined, errorMessage, undefined);

      generalError(customError, req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });
  });
});
