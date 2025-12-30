module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./src/setup.ts'],
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\.(ts|tsx)$': 'ts-jest',
  },
};
