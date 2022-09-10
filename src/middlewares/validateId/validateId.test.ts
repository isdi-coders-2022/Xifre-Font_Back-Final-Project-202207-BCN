import { NextFunction, Request, Response } from "express";
import codes from "../../configs/codes";
import mockProject from "../../test-utils/mocks/mockProject";
import mockUser from "../../test-utils/mocks/mockUser";
import CreateError from "../../utils/CreateError/CreateError";
import { CustomRequest } from "../authentication/authentication";
import validateId from "./validateId";

describe("Given a validateId function", () => {
  const res = {} as Partial<Response>;

  const next = jest.fn();

  describe("When called with a customRequest, a response and a next function as arguments", () => {
    test("Then it should call next if the user id matches the project author id", async () => {
      const customReq = {
        payload: {
          id: mockUser.id,
        },
        body: mockProject,
      } as Partial<Request>;

      await validateId(
        customReq as CustomRequest,
        res as Response,
        next as NextFunction
      );

      expect(next).toHaveBeenCalled();

      const nextCalled = next.mock.calls[0][0];

      expect(nextCalled).toBeUndefined();
    });

    test("Then it should call next with an error if the client id doesn't match the project author id", async () => {
      const customReq = {
        payload: {
          id: "RandomId",
        },
        body: mockProject,
      } as Partial<Request>;

      await validateId(customReq as CustomRequest, res as Response, next);

      const expectedError = new CreateError(
        codes.badRequest,
        "Could't update the project",
        "The client is not the author of the project"
      );

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
