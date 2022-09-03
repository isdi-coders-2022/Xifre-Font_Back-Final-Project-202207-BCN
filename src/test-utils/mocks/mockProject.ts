import IProject from "../../database/types/IProject";

const mockProject: IProject = {
  id: "630e31ecb968115ba6a3e29f",
  name: "Project name",
  description: "The description",
  technologies: ["react", "express"],
  repository: "Link to the repository",
  author: "John Doe",
  logo: "Link to the logo",
  creationDate: new Date("2022-09-02T08:35:07.126Z"),
};

export default mockProject;
