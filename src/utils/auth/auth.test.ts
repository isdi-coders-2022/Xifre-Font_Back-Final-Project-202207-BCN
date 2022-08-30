import bcrypt from "bcryptjs";
import Payload from "../../types/Payload";
import { createToken, hashCreate } from "./auth";

const mockSign = jest.fn().mockReturnValue("#");

jest.mock("jsonwebtoken", () => ({
  sign: (payload: Payload) => mockSign(payload),
}));

describe("Given a hashCreate function", () => {
  describe("When instantiated with a password as an argument", () => {
    test("Then it should call bcrypt with said password and a salt of 10", () => {
      const password = "admin";
      const salt = 10;

      bcrypt.hash = jest.fn().mockReturnValue("#");

      const returnedValue = hashCreate(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, salt);
      expect(returnedValue).toBe("#");
    });
  });
});

describe("Given a createToken function", () => {
  describe("When called with a payload as an argument", () => {
    test("Then it should return a signed token", () => {
      const mockToken: Payload = {
        id: "1234",
        name: "aaa",
      };

      const returnedValue = createToken(mockToken);

      expect(mockSign).toHaveBeenCalledWith(mockToken);
      expect(returnedValue).toBe("#");
    });
  });
});
