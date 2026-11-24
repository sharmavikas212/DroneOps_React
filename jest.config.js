module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-native$': '<rootDir>/tests/__mocks__/react-native.ts',
    '^expo-sqlite$': '<rootDir>/tests/__mocks__/expo-sqlite.ts',
    '^react-native-maps$': '<rootDir>/tests/__mocks__/react-native-maps.ts',
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
