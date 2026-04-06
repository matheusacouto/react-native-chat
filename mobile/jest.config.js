module.exports = {
  preset: "react-native",
  setupFiles: ["<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["/android/", "/ios/", "/node_modules/"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|@react-native-community|@react-native-firebase|@react-native-google-signin|react-native-safe-area-context|react-native-screens)/)",
  ],
};
