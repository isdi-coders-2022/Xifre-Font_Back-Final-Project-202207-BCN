import Payload from "../../types/Payload";
import { createToken, hashCreate } from "./auth";

describe("Given a hashCreate function", () => {
  describe("When instantiated with a string as an argument", () => {
    test("Then it should return a promise with a string that is a hash of the argument provided", async () => {
      const password = "admin";
      const hashStart = "$2a$10$";

      const result = await hashCreate(password);

      expect(result.startsWith(hashStart)).toBe(true);
      expect(result.length > 10).toBe(true);
    });
  });
});

describe("Given a createToken function", () => {
  describe("When called with a payload as an argument", () => {
    test("Then it should return a signed token", () => {
      const minExpectedSignLength = 20;
      const mockToken: Payload = {
        id: "1234",
        name: "aaa",
      };

      const result = createToken(mockToken);

      expect(result.length > minExpectedSignLength).toBe(true);
    });
  });
});
