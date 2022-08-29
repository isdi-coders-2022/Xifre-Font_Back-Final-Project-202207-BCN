import IUser from "../../database/types/IUser";
import Payload from "../../types/Payload";
import { createToken } from "../auth/auth";

const prepareToken = (user: IUser) => {
  const payload: Payload = {
    id: user.id,
    name: user.name,
  };

  const token: string = createToken(payload);

  return {
    user: {
      token,
    },
  };
};

export default prepareToken;
