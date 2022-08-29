import mockUser from "../../test-utils/mocks/mockUser";
import prepareToken from "./prepareToken";

const mockCreateToken = jest.fn().mockReturnValue("#");

jest.mock("../auth/auth", () => ({
  ...jest.requireActual("../auth/auth"),
  createToken: () => mockCreateToken(),
}));

describe("Given a prepareToken function", () => {
  describe("When called with a user as an argument", () => {
    test("Then it should call the createToken function", () => {
      prepareToken(mockUser);

      expect(mockCreateToken).toHaveBeenCalled();
    });

    test("Then it should return an object with the tokenized user", () => {
      const expectedToken = {
        user: {
          token: mockCreateToken(),
        },
      };

      const result = prepareToken(mockUser);

      expect(result).toStrictEqual(expectedToken);
    });
  });
});
