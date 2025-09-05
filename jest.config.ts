import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  testMatch: ["**/__tests__/**/*.spec.ts"],
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: "./tsconfig.json",
    },
  },
};

export default config;
