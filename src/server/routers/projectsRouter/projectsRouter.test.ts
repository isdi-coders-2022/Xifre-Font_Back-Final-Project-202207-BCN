import request from "supertest";
import app from "../..";
import codes from "../../../configs/codes";
import { endpoints } from "../../../configs/routes";
import { Project } from "../../../database/models/Project";
import IProject from "../../../database/types/IProject";
import mockProject from "../../../test-utils/mocks/mockProject";
import mockProtoProject from "../../../test-utils/mocks/mockProtoProject";
import "../../../testsSetup";

describe(`Given a /projects${endpoints.getAllProjects} route`, () => {
  describe("When requested with GET method", () => {
    test(`Then it should respond with a status of '${codes.ok}'`, async () => {
      await Project.create(mockProtoProject);

      const res = await request(app).get(
        `/projects${endpoints.getAllProjects}`
      );

      expect(res.statusCode).toBe(codes.ok);
    });

    test(`Then it should respond with a status of '${codes.notFound}' it there are no projects`, async () => {
      const res = await request(app).get(
        `/projects${endpoints.getAllProjects}`
      );

      expect(res.statusCode).toBe(codes.notFound);
    });
  });
});

describe(`Given a /projects${endpoints.projectById} route`, () => {
  describe("When requested with GET method", () => {
    test(`Then it should respond with a status of '${codes.ok}'`, async () => {
      const newProject = await Project.create(mockProtoProject);

      const res = await request(app).get(`/projects/${newProject.id}`);

      expect(res.statusCode).toBe(codes.ok);
    });

    test(`Then it should respond with a status of '${codes.notFound}' if there are no projects`, async () => {
      const res = await request(app).get("/projects/falseid");

      expect(res.statusCode).toBe(codes.notFound);
    });
  });
});

describe(`Given a /projects${endpoints.createProject} route`, () => {
  describe("When requested with POST method", () => {
    test(`Then it should respond with a status of '${codes.created}'`, async () => {
      await request(app)
        .post(`/projects/${endpoints.createProject}`)
        .type("multipart/form-data")
        .field("project", JSON.stringify(mockProtoProject))
        .attach("logo", Buffer.from("fakeImage", "utf-8"), {
          filename: "logo.jpg",
        })
        .expect(codes.created);
    });

    test("Then it should create a new project and respond with it", async () => {
      let newProject: IProject;

      await request(app)
        .post(`/projects/${endpoints.createProject}`)
        .type("multipart/form-data")
        .field("project", JSON.stringify(mockProtoProject))
        .attach("logo", Buffer.from("fakeImage", "utf-8"), {
          filename: "logo.jpg",
        })
        .then(({ body: { projectCreated } }) => {
          newProject = projectCreated;
        });

      expect(newProject).toHaveProperty("id");
      expect(newProject).toHaveProperty("creationDate");

      const res = await request(app).get(`/projects/${newProject.id}`);

      expect(res.statusCode).toBe(codes.ok);
    });

    test(`Then it should respond with a status of ${codes.badRequest} if the request was not valid`, async () => {
      await request(app)
        .post(`/projects/${endpoints.createProject}`)
        .type("multipart/form-data")
        .field(
          "project",
          JSON.stringify({
            name: mockProject.name,
          })
        )
        .attach("logo", Buffer.from("fakeImage", "utf-8"), {
          filename: "logo.jpg",
        })
        .expect(codes.badRequest);
    });
  });
});
