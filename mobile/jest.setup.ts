import "react-native-gesture-handler/jestSetup";
import "@testing-library/jest-native/extend-expect";

jest.mock("react-native-config", () => ({
  PUBLIC_API_URL: "http://localhost:3000",
  GOOGLE_WEB_CLIENT_ID: "test-web-client-id",
}));
