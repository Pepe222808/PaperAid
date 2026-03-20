module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
  collectCoverageFrom: ['src/**/*.js', '!src/screens/**', '!src/navigation/**'],
  coveragePathIgnorePatterns: ['/node_modules/'],
};
