import createHash from "./auth";

describe("Given a hashCreate function", () => {
  describe("When instantiated with a string as an argument", () => {
    test("Then it should return a promise with a string that is a hash of the argument provided", async () => {
      const password = "admin";
      const hashStart = "$2a$10$";

      const result = await createHash(password);

      expect(result.startsWith(hashStart)).toBe(true);
      expect(result.length > 10).toBe(true);
    });
  });
});
