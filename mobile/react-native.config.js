const disableAndroidCodegen = {
  cmakeListsPath: null,
  libraryName: null,
  componentDescriptors: null,
};

module.exports = {
  dependencies: {
    "@react-native-google-signin/google-signin": {
      platforms: {
        android: disableAndroidCodegen,
      },
    },
    "react-native-gesture-handler": {
      platforms: {
        android: disableAndroidCodegen,
      },
    },
  },
};
