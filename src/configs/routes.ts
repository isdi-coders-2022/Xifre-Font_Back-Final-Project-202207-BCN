export const routers = {
  users: "/users",
  projects: "/projects",
};

export const endpoints = {
  logIn: "/log-in",
  signUp: "/sign-up",
  getUserData: "/:userId",

  allProjects: "/all",
  projectById: "/:projectId",
  createProject: "/new",
  projectsByAuthor: "/author/:userId",
  deleteProject: "/delete/:projectId",
  updateProject: "/update/:projectId",
};
