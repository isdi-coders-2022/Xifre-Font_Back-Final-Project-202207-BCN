import { model, Schema } from "mongoose";
import IUser from "../types/IUser";

export const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  contacts: [String],
});

export const User = model("User", userSchema, "users");
