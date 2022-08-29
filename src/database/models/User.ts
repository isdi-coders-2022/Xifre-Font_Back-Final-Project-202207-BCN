import { model, Schema } from "mongoose";

export const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: false,
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
