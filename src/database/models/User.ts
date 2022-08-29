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

  contacts: [String],
});

userSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    const newDocument = { ...ret };
    delete newDocument.password;
    // eslint-disable-next-line no-underscore-dangle
    delete newDocument.__v;
    // eslint-disable-next-line no-underscore-dangle
    delete newDocument._id;
    return newDocument;
  },
});

export const User = model("User", userSchema, "users");
