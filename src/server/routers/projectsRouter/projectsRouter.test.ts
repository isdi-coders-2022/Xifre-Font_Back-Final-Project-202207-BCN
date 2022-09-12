import request from "supertest";
import app from "../..";
import codes from "../../../configs/codes";
import { endpoints } from "../../../configs/routes";
import { Project } from "../../../database/models/Project";
import { User } from "../../../database/models/User";
import IProject from "../../../database/types/IProject";
import IUser from "../../../database/types/IUser";
import mockProject from "../../../test-utils/mocks/mockProject";
import mockProtoProject from "../../../test-utils/mocks/mockProtoProject";
import mockUser from "../../../test-utils/mocks/mockUser";
import "../../../testsSetup";

jest.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: jest.fn().mockReturnValue({
          error: false,
        }),
        getPublicUrl: () => ({
          publicURL: "Image url",
        }),
      }),
    },
  }),
}));

jest.mock("fs/promises", () => ({
  ...jest.requireActual("fs/promises"),
  readFile: jest.fn(),
}));

const mockToFile = jest.fn();

const mockJpeg = jest.fn().mockReturnValue({
  toFile: mockToFile,
});

const mockResize = jest.fn().mockReturnValue({
  jpeg: mockJpeg,
});

jest.mock("sharp", () => () => ({
  resize: mockResize,
}));

describe(`Given a /projects${endpoints.allProjects} route`, () => {
  describe("When requested with GET method", () => {
    test(`Then it should respond with a status of '${codes.ok}'`, async () => {
      await Project.create(mockProtoProject);

      const res = await request(app).get(`/projects${endpoints.allProjects}`);

      expect(res.statusCode).toBe(codes.ok);
    });

    test(`Then it should respond with a status of '${codes.notFound}' it there are no projects`, async () => {
      const res = await request(app).get(`/projects${endpoints.allProjects}`);

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
  let author: IUser;
  let authorizationToken: string;

  beforeEach(async () => {
    await request(app)
      .post(`/users${endpoints.signUp}`)
      .send({
        name: mockUser.name,
        password: mockUser.password,
        email: mockUser.email,
      })
      .then(({ body: { newUser } }) => {
        author = newUser;
      });

    await request(app)
      .post(`/users${endpoints.logIn}`)
      .send({
        name: mockUser.name,
        password: mockUser.password,
      })
      .then(
        ({
          body: {
            user: { token },
          },
        }) => {
          authorizationToken = token;
        }
      );
  });

  describe("When requested with POST method", () => {
    test(`Then it should respond with a status of '${codes.created}'`, async () => {
      await request(app)
        .post(`/projects/${endpoints.createProject}`)
        .set("Authorization", `Bearer ${authorizationToken}`)
        .type("multipart/form-data")
        .field(
          "project",
          JSON.stringify({ ...mockProtoProject, authorId: author.id })
        )
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
        .set("Authorization", `Bearer ${authorizationToken}`)
        .field(
          "project",
          JSON.stringify({ ...mockProtoProject, authorId: author.id })
        )
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
        .set("Authorization", `Bearer ${authorizationToken}`)
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

    test(`Then it should respond with a status of ${codes.notFound} if the project has no author`, async () => {
      await request(app)
        .post(`/projects/${endpoints.createProject}`)
        .type("multipart/form-data")
        .set("Authorization", `Bearer ${authorizationToken}`)
        .field(
          "project",
          JSON.stringify({ ...mockProtoProject, authorId: mockUser.id })
        )
        .attach("logo", Buffer.from("fakeImage", "utf-8"), {
          filename: "logo.jpg",
        })
        .expect(codes.notFound);
    });
  });

  describe("When requested with POST method but the client is not authenticated", () => {
    test(`Then it should respond with a status of ${codes.internalServerError}`, async () => {
      await request(app)
        .post(`/projects/${endpoints.createProject}`)
        .type("multipart/form-data")
        .field(
          "project",
          JSON.stringify({
            ...mockProtoProject,
            authorId: author.id,
          })
        )
        .attach("logo", Buffer.from("fakeImage", "utf-8"), {
          filename: "logo.jpg",
        })
        .expect(codes.internalServerError);
    });
  });
});

describe(`Given a /projects${endpoints.projectsByAuthor} route`, () => {
  describe("When requested with GET method", () => {
    test(`Then it should respond with a status of '${codes.ok}'`, async () => {
      const mockDbProject = await Project.create(mockProtoProject);
      const mockDbUser = await User.create({
        ...mockUser,
        projects: [mockDbProject.id],
      });

      const res = await request(app).get(`/projects/author/${mockDbUser.id}`);

      expect(res.statusCode).toBe(codes.ok);
    });

    test(`Then it should respond with a status of '${codes.notFound}' if the requesting user doesn't exist`, async () => {
      const res = await request(app).get(`/projects/author/${mockUser.id}`);

      expect(res.statusCode).toBe(codes.notFound);
    });

    test(`Then it should respond with a status of '${codes.notFound}' if the user has no projects`, async () => {
      const mockDbUser = await User.create(mockUser);

      const res = await request(app).get(`/projects/author/${mockDbUser.id}`);

      expect(res.statusCode).toBe(codes.notFound);
    });
  });
});

describe(`Given a /projects${endpoints.deleteProject} route`, () => {
  let author: IUser;
  let authorizationToken: string;
  let project: IProject;

  beforeEach(async () => {
    await request(app)
      .post(`/users${endpoints.signUp}`)
      .send({
        name: mockUser.name,
        password: mockUser.password,
        email: mockUser.email,
      })
      .then(({ body: { newUser } }) => {
        author = newUser;
      });

    await request(app)
      .post(`/users${endpoints.logIn}`)
      .send({
        name: mockUser.name,
        password: mockUser.password,
      })
      .then(
        ({
          body: {
            user: { token },
          },
        }) => {
          authorizationToken = token;
        }
      );

    await request(app)
      .post(`/projects/${endpoints.createProject}`)
      .set("Authorization", `Bearer ${authorizationToken}`)
      .type("multipart/form-data")
      .field(
        "project",
        JSON.stringify({ ...mockProtoProject, authorId: author.id })
      )
      .attach("logo", Buffer.from("fakeImage", "utf-8"), {
        filename: "logo.jpg",
      })
      .expect(codes.created)
      .then(({ body: { projectCreated } }) => {
        project = projectCreated;
      });
  });

  describe("When requested with DELETE method", () => {
    test(`Then it should respond with a status of '${codes.deletedWithResponse}'`, async () => {
      await request(app)
        .delete(`/projects/delete/${project.id}`)
        .set("Authorization", `Bearer ${authorizationToken}`)
        .expect(codes.deletedWithResponse);
    });

    test(`Then it should respond with a status of '${codes.created}' if the project was not found`, async () => {
      await request(app)
        .delete(`/projects/delete/randomId`)
        .set("Authorization", `Bearer ${authorizationToken}`)
        .expect(codes.notFound);
    });

    test("Then it should delete the project even if the author doesn't exist", async () => {
      await User.findByIdAndDelete(author.id);

      await request(app)
        .delete(`/projects/delete/${project.id}`)
        .set("Authorization", `Bearer ${authorizationToken}`)
        .expect(codes.deletedWithResponse);
    });

    test(`Then it should respond with a status of ${codes.badRequest} if the client is not author of the project`, async () => {
      const extraMockDbProject = await Project.create(mockProtoProject);

      await request(app)
        .delete(`/projects/delete/${extraMockDbProject.id}`)
        .set("Authorization", `Bearer ${authorizationToken}`)
        .expect(codes.badRequest);
    });
  });
});

describe(`Given a /projects${endpoints.updateProject} route`, () => {
  let author: IUser;
  let authorizationToken: string;

  beforeEach(async () => {
    await request(app)
      .post(`/users${endpoints.signUp}`)
      .send({
        name: mockUser.name,
        password: mockUser.password,
        email: mockUser.email,
      })
      .then(({ body: { newUser } }) => {
        author = newUser;
      });

    await request(app)
      .post(`/users${endpoints.logIn}`)
      .send({
        name: mockUser.name,
        password: mockUser.password,
      })
      .then(
        ({
          body: {
            user: { token },
          },
        }) => {
          authorizationToken = token;
        }
      );
  });

  describe("When requested with PUT method", () => {
    test(`Then it should respond with a status of '${codes.ok}'`, async () => {
      let project: IProject;

      await request(app)
        .post(`/projects/${endpoints.createProject}`)
        .set("Authorization", `Bearer ${authorizationToken}`)
        .type("multipart/form-data")
        .field(
          "project",
          JSON.stringify({ ...mockProtoProject, authorId: author.id })
        )
        .attach("logo", Buffer.from("fakeImage", "utf-8"), {
          filename: "logo.jpg",
        })
        .then(({ body: { projectCreated } }) => {
          project = projectCreated;
        });

      await request(app)
        .put(`/projects/update/${project.id}`)
        .set("Authorization", `Bearer ${authorizationToken}`)
        .type("multipart/form-data")
        .field(
          "project",
          JSON.stringify({ ...mockProtoProject, authorId: author.id })
        )
        .attach("logoUpdate", Buffer.from("fakeImage", "utf-8"), {
          filename: "new-logo.jpg",
        })
        .expect(codes.ok);
    });

    test("Then it should update the project and respond with it", async () => {
      let project: IProject;

      await request(app)
        .post(`/projects/${endpoints.createProject}`)
        .set("Authorization", `Bearer ${authorizationToken}`)
        .type("multipart/form-data")
        .field(
          "project",
          JSON.stringify({ ...mockProtoProject, authorId: author.id })
        )
        .attach("logo", Buffer.from("fakeImage", "utf-8"), {
          filename: "logo.jpg",
        })
        .then(({ body: { projectCreated } }) => {
          project = projectCreated;
        });

      await request(app)
        .put(`/projects/update/${project.id}`)
        .set("Authorization", `Bearer ${authorizationToken}`)
        .type("multipart/form-data")
        .field(
          "project",
          JSON.stringify({ ...mockProtoProject, authorId: author.id })
        )
        .attach("logoUpdate", Buffer.from("fakeImage", "utf-8"), {
          filename: "new-logo.jpg",
        })
        .expect(codes.ok)
        .then((data) => {
          expect(data.body.updatedProject).toHaveProperty("authorId");
        });
    });
  });

  test(`Then it should respond with a status of ${codes.badRequest} if the request was not valid`, async () => {
    await request(app)
      .put("/projects/update/randomId")
      .set("Authorization", `Bearer ${authorizationToken}`)
      .type("multipart/form-data")
      .field(
        "project",
        JSON.stringify({ ...mockProtoProject, authorId: author.id })
      )
      .attach("logoUpdate", Buffer.from("fakeImage", "utf-8"), {
        filename: "logo.jpg",
      })
      .expect(codes.badRequest);
  });

  describe("When requested with PUT method and there is no image to upload", () => {
    let project: IProject;

    test("Then it should not change the image name and update the project", async () => {
      await request(app)
        .post(`/projects/${endpoints.createProject}`)
        .set("Authorization", `Bearer ${authorizationToken}`)
        .type("multipart/form-data")
        .field(
          "project",
          JSON.stringify({ ...mockProtoProject, authorId: author.id })
        )
        .attach("logo", Buffer.from("fakeImage", "utf-8"), {
          filename: "logo.jpg",
        })
        .then(({ body: { projectCreated } }) => {
          project = projectCreated;
        });

      await request(app)
        .put(`/projects/update/${project.id}`)
        .set("Authorization", `Bearer ${authorizationToken}`)
        .type("multipart/form-data")
        .field(
          "project",
          JSON.stringify({ ...mockProtoProject, logo: "", authorId: author.id })
        )
        .attach("logoUpdate", Buffer.from("fakeImage", "utf-8"), {
          filename: undefined,
        })
        .then((data) => {
          expect(data.body.updatedProject.logo).toBe(project.logo);
        });
    });
  });

  describe("When requested with PUT method but the client is not authenticated", () => {
    test(`Then it should respond with a status of ${codes.internalServerError}`, async () => {
      const project = await Project.create(mockProtoProject);

      await request(app)
        .put(`/projects/update/${project.id}`)
        .set("Authorization", "Beare bad token")
        .type("multipart/form-data")
        .field(
          "project",
          JSON.stringify({ ...mockProtoProject, authorId: author.id })
        )
        .attach("logoUpdate", Buffer.from("fakeImage", "utf-8"), {
          filename: "new-logo",
        })
        .expect(codes.internalServerError);
    });
  });
});
