module.exports = {
  "roots": [
    "<rootDir>/src",
  ],
  modulePathIgnorePatterns: ["perf"],
  "testMatch": [
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
}
