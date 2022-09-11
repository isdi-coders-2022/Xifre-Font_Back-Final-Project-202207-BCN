import multer from "multer";
import { multerFilter } from "./multer";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Given a multerFilter function", () => {
  describe("When called with a request, a file and a callback function", () => {
    const req = {} as Express.Request;

    const file = {
      fieldname: "logo_update",
      originalname: "",
    } as Express.Multer.File;
    const callback = jest.fn() as multer.FileFilterCallback;

    describe("When the file fieldname is 'logo_update' and the file has no filename", () => {
      test("Then it should call the callback function with null and false as arguments", () => {
        multerFilter(req, file, callback);

        expect(callback).toHaveBeenCalledWith(null, false);
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });

    describe("When the fieldname is 'logo'", () => {
      test("Then it should call the callback function with null and true", () => {
        file.fieldname = "logo";

        multerFilter(req, file, callback);

        expect(callback).toHaveBeenCalledWith(null, true);
        expect(callback).toHaveBeenCalledTimes(1);
      });
    });
  });
});
