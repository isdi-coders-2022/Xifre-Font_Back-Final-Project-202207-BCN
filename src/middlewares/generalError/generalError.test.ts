import { NextFunction, Request, Response } from "express";
import { errors, ValidationError } from "express-validation";
import codes from "../../configs/codes";
import CreateError from "../../utils/CreateError/CreateError";
import generalError from "./generalError";

describe("Given a generalError function (middleware)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const req = {} as Partial<Request>;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as Partial<Response>;

  const next = jest.fn() as NextFunction;
  describe("When called with a custom error (with undefined parameters), a request and a response as arguments", () => {
    test(`Then it should call res.status with a default status of '${codes.internalServerError}'`, () => {
      const customError = new CreateError(undefined, undefined, undefined);

      generalError(customError, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(codes.internalServerError);
    });

    test("Then it should call json with a generic error message of 'Something went wrong'", () => {
      const expectedMessage = "Something went wrong";
      const expectedResponse = { error: expectedMessage };
      const customError = new CreateError(undefined, undefined, undefined);

      generalError(customError, req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(expectedResponse);
    });
  });

  describe(`When called with a custom error with a code of ${codes.internalServerError}`, () => {
    test(`Then it should call res.status with a default status of '${codes.internalServerError}'`, () => {
      const customError = new CreateError(
        codes.internalServerError,
        undefined,
        undefined
      );

      generalError(customError, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(codes.internalServerError);
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

  describe("When called with a validation error", () => {
    class JoiError extends ValidationError {
      statusCode = codes.badRequest;
      error = "";
      details = { body: [] } as errors;
    }

    const falseError = new JoiError({ body: [] } as errors, {});

    test(`Then it should call status with a error code of '${codes.badRequest}'`, () => {
      generalError(falseError, req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(codes.badRequest);
    });

    test("Then it should respond with an error 'Bad request'", () => {
      const errorMessage = { error: "Bad request" };

      generalError(falseError, req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(errorMessage);
    });
  });
});
