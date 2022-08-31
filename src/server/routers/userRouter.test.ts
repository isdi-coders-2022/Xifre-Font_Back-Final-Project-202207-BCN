import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "..";
import connectDB from "../../database";
import { User } from "../../database/models/User";
import mockUser from "../../test-utils/mocks/mockUser";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUrl = mongoServer.getUri();

  await connectDB(mongoUrl);
});

afterAll(async () => {
  await mongoose.connection.close();

  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany();
});

describe("Given a /users/sign-up route", () => {
  describe("When requested with POST method", () => {
    test("Then it should respond with a status of 200", async () => {
      const expectedStatus = 200;

      const res = await request(app).post("/users/sign-up").send({
        name: mockUser.name,
        password: mockUser.password,
        email: mockUser.email,
      });

      expect(res.statusCode).toBe(expectedStatus);
    });

    test("Then it should respond with a status of 404 if the user data is invalid", async () => {
      const expectedStatus = 404;

      const res = await request(app).post("/users/sign-up").send("");

      expect(res.statusCode).toBe(expectedStatus);
    });

    test("Then it should respond with a status of 404 if there was an error while creating the user", async () => {
      const expectedStatus = 404;

      await User.create(mockUser);

      const res = await request(app).post("/users/sign-up").send({
        name: mockUser.name,
        password: mockUser.password,
        email: mockUser.email,
      });

      expect(res.statusCode).toBe(expectedStatus);
    });
  });
});
