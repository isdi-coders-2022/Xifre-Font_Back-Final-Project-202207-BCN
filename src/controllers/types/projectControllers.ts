import IProject from "../../database/types/IProject";

type ProtoProject = Omit<IProject, "id" | "creationDate">;

export default ProtoProject;
