module.exports = {
  "roots": [
    "<rootDir>/src",
  ],
    testEnvironment: 'jsdom',
  "testMatch": [
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
}
