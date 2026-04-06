const path = require("path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const projectRoot = __dirname;
const defaultConfig = getDefaultConfig(projectRoot);

module.exports = mergeConfig(defaultConfig, {
  resolver: {
    extraNodeModules: {
      "@/src": path.join(projectRoot, "src"),
    },
  },
});
