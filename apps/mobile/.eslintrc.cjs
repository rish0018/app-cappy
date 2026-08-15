module.exports = {
  ...require("@cappy/config/eslint-preset.js"),
  ignorePatterns: ["dist", ".expo", "android", "ios"],
  rules: {
    ...require("@cappy/config/eslint-preset.js").rules,
    // Metro/RN convention: static assets (images, sounds) and Metro's own
    // CommonJS config file are require()'d, not imported. metro.config.js
    // already carried a per-line disable for this same reason.
    "@typescript-eslint/no-var-requires": "off",
  },
};
