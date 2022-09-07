import { queries } from "../../configs/routes";
import checkQueries from "./checkQueries";

describe("Given a checkQueries function", () => {
  describe("When called with an a list of wrong queries as an argument", () => {
    test("Then it should return a list of default queries", () => {
      const badQueryOne = { key: "offset" as keyof typeof queries, value: "a" };
      const badQueryTwo = { key: "limit" as keyof typeof queries, value: "b" };

      const expectedResult: number[] = [0, 10];

      const result = checkQueries(badQueryOne, badQueryTwo);

      expect(result).toEqual(expectedResult);
    });
  });

  describe("When called with a list of correct queries as an argument", () => {
    test("Then it should return a list of the queries values", () => {
      const goodQueryOne = {
        key: "offset" as keyof typeof queries,
        value: "2",
      };
      const goodQueryTwo = {
        key: "limit" as keyof typeof queries,
        value: "5",
      };

      const expectedResult: number[] = [2, 5];

      const result = checkQueries(goodQueryOne, goodQueryTwo);

      expect(result).toEqual(expectedResult);
    });
  });

  describe("When called with a list with one incorrect query key", () => {
    test("Then it should return a list with the correct query value", () => {
      const badQuery = {
        key: "falseKey" as keyof typeof queries,
        value: "2",
      };
      const gooodQuery = {
        key: "limit" as keyof typeof queries,
        value: "5",
      };

      const expectedResult: number[] = [5];

      const result = checkQueries(badQuery, gooodQuery);

      expect(result).toEqual(expectedResult);
    });
  });

  describe("When called with a query that is a word an another that is a number", () => {
    test("Then it should keep the word as a string and convert the number to an actual number", () => {
      const wordQuery = {
        key: "technology" as keyof typeof queries,
        value: "express",
      };
      const numberQuery = {
        key: "limit" as keyof typeof queries,
        value: "5",
      };

      const expectedResult: Array<number | string> = ["express", 5];

      const result = checkQueries(wordQuery, numberQuery);

      expect(result).toEqual(expectedResult);
    });
  });
});
