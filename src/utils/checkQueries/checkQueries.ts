import { queries } from "../../configs/routes";

export type OkQueries = keyof typeof queries;

interface QueryValue {
  key: OkQueries;
  value: string;
}

const setValue = (query: string, defaultValue: number) =>
  +query ? +query : defaultValue;

const checkQueries = (...reqQuery: QueryValue[]) =>
  reqQuery
    .filter((query) => queries[query.key] !== undefined)
    .map((query) =>
      queries[query.key].type === "number"
        ? setValue(query.value, queries[query.key].default as number)
        : query.value?.toString()
    );

export default checkQueries;
