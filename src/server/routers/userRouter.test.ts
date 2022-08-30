import request from "supertest";
import app from "..";
import { User } from "../../database/models/User";
import mockUser from "../../test-utils/mocks/mockUser";

jest.mock("../../utils/auth/auth", () => ({
  ...jest.requireActual("../../utils/auth/auth"),
  hashCreate: () => jest.fn().mockReturnValue("#"),
  createToken: () => jest.fn().mockReturnValue("#"),
}));

describe("Given a /users/sign-up route", () => {
  describe("When requested with POST method", () => {
    test("Then it should respond with a status of 200", async () => {
      User.create = jest.fn().mockReturnValue(mockUser);
      const expectedStatus = 200;

      const res = await request(app).post("/users/sign-up").send({
        name: "name",
        password: "password",
        email: "email@email.com",
      });

      expect(res.statusCode).toBe(expectedStatus);
    });

    test("Then it should respond with a status of 400 if the user data is invalid", async () => {
      User.create = jest.fn().mockReturnValue(mockUser);
      const expectedStatus = 404;

      const res = await request(app).post("/users/sign-up").send("");

      expect(res.statusCode).toBe(expectedStatus);
    });

    test("Then it should respond with a status of 404 if there was an error while creating the user", async () => {
      User.create = jest.fn().mockRejectedValue(new Error());
      const expectedStatus = 404;

      const res = await request(app)
        .post("/users/sign-up")
        .send({ name: "name", password: "password", email: "email@email.com" });

      expect(res.statusCode).toBe(expectedStatus);
    });
  });
});
