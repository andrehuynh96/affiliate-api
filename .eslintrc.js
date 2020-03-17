module.exports = {
  extends: ["eslint:recommended"],
  plugins: ["prettier"],
  env: {
    commonjs: true,
    es6: true,
    node: true,
    mocha: true
  },
  parserOptions: {
    ecmaVersion: 8,
    sourceType: "module",
    ecmaFeatures: {
      modules: true,
      experimentalObjectRestSpread: true,
    }
  },
  rules: {
    "object-curly-spacing": [2, "always"],
    strict: 0,
    quotes: [2, "single", "avoid-escape"],
    semi: [1, "always"],
    "keyword-spacing": [2, { before: true, after: true }],
    "space-infix-ops": 2,
    "spaced-comment": [2, "always"],
    "arrow-spacing": 2,
    "no-console": 0,
    'prefer-const': 2,
    'no-unused-vars': 0,
  }
};
