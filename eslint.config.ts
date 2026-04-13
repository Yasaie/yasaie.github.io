import js from '@eslint/js'
import betterTailwind from 'eslint-plugin-better-tailwindcss'
import perfectionist from 'eslint-plugin-perfectionist'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import ts from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

export default ts.config(
  { ignores: ['dist/**', 'node_modules/**'] },

  js.configs.recommended,

  ...ts.configs.recommended,

  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.ts', '**/*.vue'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-imports': 'error',
      'perfectionist/sort-named-imports': 'error',
      'vue/attributes-order': 'error',
      'vue/define-macros-order': ['error', {
        order: ['defineProps', 'defineEmits', 'defineSlots', 'defineExpose'],
      }],
    },
  },

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: ts.parser,
        sourceType: 'module',
      },
    },
  },

  {
    files: ['**/*.ts', '**/*.vue'],
    plugins: {
      'better-tailwindcss': betterTailwind,
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/main.css',
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      'better-tailwindcss/enforce-canonical-classes': 'error',
    },
  },
)
