module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
      },
    }],
  },
  fakeTimers: {
    enableGlobally: false,
  },
  testMatch: ['<rootDir>/tests/**/*.test.(ts|tsx)'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/specs/'],
};
