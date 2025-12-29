module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended', // 或 'plugin:vue/recommended' 根据你的 Vue 版本
    '@vue/typescript/recommended' // 如果使用 TypeScript
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser' // 如果使用 TypeScript
  },
  rules: {
    // 你的自定义规则
  }
}