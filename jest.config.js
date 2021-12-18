/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  displayName: {
    name: 'UNRAID',
    color: 'orange',
  },
  collectCoverage: true,
  coverageReporters: ['text'],
  collectCoverageFrom: ['!<rootDir>/tests/', 'src/**/*.ts', '!<rootDir>/src/index.ts'],
  coverageProvider: 'babel',
  moduleNameMapper: {
    '@system/(.*)': '<rootDir>/src/modules/system/extensions/$1',
  },
};
