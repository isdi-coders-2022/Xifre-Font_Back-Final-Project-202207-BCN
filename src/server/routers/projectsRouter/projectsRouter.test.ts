import request from "supertest";
import app from "../..";
import codes from "../../../configs/codes";
import { endpoints } from "../../../configs/routes";
import ProtoProject from "../../../controllers/types/projectControllers";
import { Project } from "../../../database/models/Project";
import IProject from "../../../database/types/IProject";
import mockProject from "../../../test-utils/mocks/mockProject";
import "../../../testsSetup";

describe(`Given a /projects${endpoints.getAllProjects} route`, () => {
  describe("When requested with GET method", () => {
    test(`Then it should respond with a status of '${codes.ok}'`, async () => {
      await Project.create({
        name: mockProject.name,
        description: mockProject.description,
        repository: mockProject.repository,
        author: mockProject.author,
        logo: mockProject.logo,
        technologies: mockProject.technologies,
      });

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
      const newProject = await Project.create({
        name: mockProject.name,
        description: mockProject.description,
        repository: mockProject.repository,
        author: mockProject.author,
        logo: mockProject.logo,
        technologies: mockProject.technologies,
      });

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
      const res = await request(app)
        .post(`/projects/${endpoints.createProject}`)
        .send({
          name: mockProject.name,
          author: mockProject.author,
          description: mockProject.description,
          logo: mockProject.logo,
          repository: mockProject.repository,
          technologies: mockProject.technologies,
        } as ProtoProject);

      expect(res.statusCode).toBe(codes.created);
    });

    test("Then it should create a new project and respond with it", async () => {
      let newProject: any;

      await request(app)
        .post(`/projects/${endpoints.createProject}`)
        .send({
          name: mockProject.name,
          author: mockProject.author,
          description: mockProject.description,
          logo: mockProject.logo,
          repository: mockProject.repository,
          technologies: mockProject.technologies,
        } as ProtoProject)
        .then((data) => {
          newProject = data;
        });

      expect(newProject.body.projectCreated).toHaveProperty("id");
      expect(newProject.body.projectCreated).toHaveProperty("creationDate");

      const res = await request(app).get(
        `/projects/${newProject.body.projectCreated.id}`
      );

      expect(res.statusCode).toBe(codes.ok);
    });
  });
});
