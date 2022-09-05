interface IProject {
  id: string;
  name: string;
  repository: string;
  technologies: string[];
  creationDate: Date;
  author: string;
  authorId: string;
  description: string;
  logo: string;
}

export default IProject;
