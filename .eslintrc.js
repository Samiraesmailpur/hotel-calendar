module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: [
    "plugin:vue/base",
    "plugin:vue/essential",
    "plugin:vue/strongly-recommended",
    "plugin:vue/recommended",
  ],
  plugins: ["vue"],
  rules: {
    "vue/multi-word-component-names": "off",
  },
};
