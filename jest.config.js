/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/server/startServer.ts",
    "!src/database/index.ts",
    "!src/server/sockets/listeners.ts",
    "!src/server/sockets/messaging.ts",
    "!src/server/socketsServer.ts",
  ],
};
