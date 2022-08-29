import CreateError from "./CreateError";

describe("Given a CreateError function", () => {
  const errorCode = 500;
  const errorMessage = "Public error";
  const privateErrorMessage = "Private error";
  describe("When instantiated with a message 'Public error'", () => {
    test("Then it should return an error object with said message", () => {
      const expectedError = new Error(errorMessage);

      const resultError = new CreateError(
        errorCode,
        errorMessage,
        privateErrorMessage
      );

      expect(resultError).toEqual(expectedError);
    });

    test("Then it should return an error object which also contains the remaining data", () => {
      const resultError = new CreateError(
        errorCode,
        errorMessage,
        privateErrorMessage
      );

      expect(resultError.code).toBe(errorCode);
      expect(resultError.message).toBe(errorMessage);
      expect(resultError.privateMessage).toBe(privateErrorMessage);
    });
  });
});
