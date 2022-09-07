import { queries } from "../../configs/routes";

export type OkQueries = keyof typeof queries;

interface QueryValue {
  key: OkQueries;
  value: string;
}

const setValue = (query: string, defaultValue: number) =>
  Object.is(+query, NaN) ? defaultValue : +query;

const checkQueries = (...reqQuery: Array<QueryValue>) =>
  reqQuery
    .filter((query) => queries[query.key] !== undefined)
    .map((query) =>
      queries[query.key].type === "number"
        ? setValue(query.value, queries[query.key].default as number)
        : query.value
    );

export default checkQueries;
