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

  author: {
    type: String,
    required: true,
  },

  creationDate: {
    type: Date,
    default: Date.now,
  },

  logo: {
    type: String,
  },
});

export const Project = model("Project", projectSchema, "projects");
