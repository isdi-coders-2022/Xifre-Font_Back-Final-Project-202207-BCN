import { model, Schema } from "mongoose";
import IProject from "../types/IProject";

export const projectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  technologies: {
    type: [String],
    required: false,
  },

  repository: {
    type: String,
    required: true,
  },

  author: {
    type: String,
    required: true,
  },

  authorId: {
    type: String,
    required: true,
  },

  creationDate: {
    type: Date,
    default: Date.now,
  },

  logo: {
    type: String,
    required: true,
  },

  logoBackup: {
    type: String,
    required: true,
  },
});

export const Project = model("Project", projectSchema, "projects");
