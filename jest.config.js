module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/engines', '<rootDir>/config'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@helper/(.*)$': '<rootDir>/src/helper/$1',
    '^@resources/(.*)$': '<rootDir>/resources/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@extend/(.*)$': '<rootDir>/extend/$1',
    '^@playq$': '<rootDir>/src/global',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  testTimeout: 30000,
};
