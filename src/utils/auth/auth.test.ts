import bcrypt from "bcryptjs";
import Payload from "../../types/Payload";
import { createToken, hashCompare, hashCreate } from "./auth";

const mockSign = jest.fn().mockReturnValue("#");

jest.mock("jsonwebtoken", () => ({
  sign: (payload: Payload) => mockSign(payload),
}));

describe("Given a hashCreate function", () => {
  describe("When instantiated with a password as an argument", () => {
    test("Then it should call bcrypt with said password and a salt of 10, and return its returned value", () => {
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
    test("Then it should call jwt and return its returned value", () => {
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

describe("Given a hashCompare function", () => {
  describe("When called with two strings (a hash and a hash  to compare)", () => {
    test("Then it should call bcrypt compare with said arguments and return its returned value", () => {
      const hashToCompare = "#";
      const hash = "#";

      bcrypt.compare = jest.fn().mockReturnValue("#");

      const returnedValue = hashCompare(hashToCompare, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(hashToCompare, hash);
      expect(returnedValue).toBe("#");
    });
  });
});
