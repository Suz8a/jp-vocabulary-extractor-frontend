import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import pluginImport from 'eslint-plugin-import'; // <-- 1. ADDED IMPORT HERE
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Define __filename and __dirname for FlatCompat in ESM scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. FlatCompat initialization
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

const JS_ALLOWED_TO_IMPORT_DEV_DEPS = [
    'src/setupTests.js',
    'src/setupTestsEnv.js',
    'src/headers.js',
    'cypress/**/*',
    '**/mock.tsx',
    '**/mocks.ts',
    '**/mock/**/*',
    'deployment/nginx.js',
    '.storybook/**/*',
    'vite.config.ts',
];

// -------------------------------------------------------------------------
// FIX: Intercept and modify airbnb-typescript config before spreading
// -------------------------------------------------------------------------
const airbnbTypeScriptConfigs = compat.extends('airbnb-typescript');

// The problematic rules (lines-between-class-members, no-throw-literal)
// are deprecated in modern @typescript-eslint, but still included in legacy
// airbnb-typescript. We must manually disable them in the config object
// that is causing the crash. This is usually the last object in the array.
const lastAirbnbTSConfig = airbnbTypeScriptConfigs[airbnbTypeScriptConfigs.length - 1];

if (lastAirbnbTSConfig && lastAirbnbTSConfig.rules) {
    // Explicitly disable the deprecated rules in the config object that introduces them
    lastAirbnbTSConfig.rules['@typescript-eslint/lines-between-class-members'] = 'off';
    lastAirbnbTSConfig.rules['@typescript-eslint/no-throw-literal'] = 'off';
}
// -------------------------------------------------------------------------

export default [
    // --- BASE AIRBNB CONFIG ---
    // Rules here are applied first and are low precedence
    ...compat.extends('airbnb'),
    {
        // This block handles parser setup, plugins, and import settings (which must be global)
        plugins: {
            prettier,
            '@typescript-eslint': typescriptEslint,
            import: pluginImport, // <-- 2. ADDED PLUGIN REGISTRATION HERE
        },

        settings: {
            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx'],
            },
            'import/resolver': {
                // THIS IS THE KEY PART
                typescript: {
                    // Tells the import plugin to use your tsconfig for path resolution
                    project: ['./tsconfig.json'], // <-- ADDED: Explicitly tell the resolver where to find tsconfig
                    alwaysTryTypes: true,
                },
                // You may also need to explicitly use 'node' resolver
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                },
            },
        },

        rules: {
            'func-style': 'off',
            'func-names': ['warn', 'as-needed'],
            'object-shorthand': ['error', 'properties'],
            'prefer-destructuring': [
                'error',
                {
                    VariableDeclarator: {
                        array: false,
                        object: true,
                    },
                    AssignmentExpression: {
                        array: false,
                        object: false,
                    },
                },
                {
                    enforceForRenamedProperties: false,
                },
            ],
            'no-continue': 'off',
            'no-plusplus': [
                'error',
                {
                    allowForLoopAfterthoughts: true,
                },
            ],
            eqeqeq: ['error', 'smart'],
            'import/prefer-default-export': 'off',
            'import/no-duplicates': [
                'error',
                {
                    considerQueryString: true,
                },
            ],
            'one-var': 'off',
            'getter-return': 'warn',
            'no-restricted-properties': [
                'error',
                {
                    object: 'arguments',
                    property: 'callee',
                    message: 'arguments.callee is deprecated',
                },
                {
                    object: 'global',
                    property: 'isFinite',
                    message: 'Please use Number.isFinite instead',
                },
                {
                    object: 'self',
                    property: 'isFinite',
                    message: 'Please use Number.isFinite instead',
                },
                {
                    object: 'window',
                    property: 'isFinite',
                    message: 'Please use Number.isFinite instead',
                },
                {
                    object: 'global',
                    property: 'isNaN',
                    message: 'Please use Number.isNaN instead',
                },
                {
                    object: 'self',
                    property: 'isNaN',
                    message: 'Please use Number.isNaN instead',
                },
                {
                    object: 'window',
                    property: 'isNaN',
                    message: 'Please use Number.isNaN instead',
                },
                {
                    property: '__defineGetter__',
                    message: 'Please use Object.defineProperty instead.',
                },
                {
                    property: '__defineSetter__',
                    message: 'Please use Object.defineProperty instead.',
                },
                {
                    object: 'Math',
                    property: 'pow',
                    message: 'Use the exponentiation operator (**) instead.',
                },
                {
                    object: 'require',
                    property: 'ensure',
                    message:
                        'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
                },
                {
                    object: 'System',
                    property: 'import',
                    message:
                        'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
                },
            ],
            'no-unused-vars': [
                'error',
                {
                    args: 'after-used',
                    ignoreRestSiblings: true,
                    argsIgnorePattern: '^_',
                },
            ],
            'no-param-reassign': [
                'error',
                {
                    props: true,
                    ignorePropertyModificationsFor: [
                        'acc',
                        'accumulator',
                        'e',
                        'event',
                        'ctx',
                        'context',
                        'req',
                        'request',
                        'res',
                        'response',
                        '$scope',
                        'staticContext',
                    ],
                    ignorePropertyModificationsForRegex: ['Ref$'],
                },
            ],
            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: JS_ALLOWED_TO_IMPORT_DEV_DEPS,
                },
            ],
        },

        languageOptions: {
            parser: tsParser, // Set TS parser globally
            ecmaVersion: 2020,
            sourceType: 'module',
            parserOptions: {},
        },
    },

    // --- AIRBNB-TYPESCRIPT CONFIG (Modified to fix crashes) ---
    ...airbnbTypeScriptConfigs,

    // --- CUSTOM TYPESCRIPT OVERRIDES ---
    {
        files: ['**/*.mts', '**/*.ts', '**/*.tsx'],

        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.json'],
            },
        },

        rules: {
            // Non-deprecated overrides
            'consistent-return': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-empty-function': [
                'error',
                {
                    allow: ['arrowFunctions', 'functions', 'methods'],
                },
            ],

            // Re-enabling/cleaning up `no-unused-vars`
            'no-unused-vars': 'off', // Turn off base rule
            '@typescript-eslint/no-unused-vars': [
                // Re-enable TS version
                'error',
                {
                    args: 'after-used',
                    ignoreRestSiblings: true,
                    argsIgnorePattern: '^_',
                },
            ],
            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: [
                        ...JS_ALLOWED_TO_IMPORT_DEV_DEPS,
                        '**/*.test.ts',
                        '**/*.test.tsx',
                        'src/setupTests.ts',
                        '**/mock/*',
                        '**/mock-test/*.ts',
                        '**/mock-tests/*.ts',
                    ],
                },
            ],
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'variable',
                    format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                },
                {
                    selector: 'variable',
                    modifiers: ['destructured'],
                    format: null,
                },
                {
                    selector: 'function',
                    format: ['camelCase', 'PascalCase'],
                },
                {
                    selector: 'typeLike',
                    format: ['PascalCase'],
                },
            ],
        },
    },

    // --- CONFIG FILES (.mts) ---
    {
        files: ['**/*.config.mts'],

        rules: {
            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: true,
                },
            ],
        },
    },

    // --- REACT HOOKS CONFIG ---
    ...compat.extends('airbnb/hooks'),
    {
        files: ['**/*.tsx', '**/*.jsx', '**/*.js'],

        rules: {
            'react/jsx-props-no-spreading': 'off',
            'react/function-component-definition': [
                'error',
                {
                    namedComponents: ['arrow-function', 'function-expression'],
                    unnamedComponents: ['arrow-function', 'function-expression'],
                },
            ],
            'react/react-in-jsx-scope': 'off',
            'react/require-default-props': [
                'error',
                {
                    forbidDefaultForRequired: true,
                    functions: 'ignore',
                },
            ],
            'jsx-a11y/control-has-associated-label': 'off',
            'jsx-a11y/label-has-associated-control': 'off',
        },
    },

    // TODO: This rules only breaks if file extension is not specified when running eslint.
    // --- JAVASCRIPT/JSX FILES (Disable type-aware dot-notation) ---
    // {
    //     files: ['**/*.js', '**/*.jsx'],
    //     // These files lack type information (parserOptions.project is only set for TS/TSX).
    //     // The following type-aware rules breaks, so we must disable it explicitly.
    //     rules: {
    //         '@typescript-eslint/dot-notation': 'off',
    //         '@typescript-eslint/no-implied-eval': 'off',
    //         '@typescript-eslint/return-await': 'off',
    //     },
    // },

    // --- PRETTIER CONFIG ---
    // Prettier config should usually be one of the last extensions
    ...compat.extends('prettier'),
    {
        files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.mts'],

        rules: {
            'prettier/prettier': 'warn',
        },
    },

    // 🏆 FINAL HIGH-PRECEDENCE GLOBAL OVERRIDES
    // This block is defined last to guarantee these rules take effect over all
    // preceding `compat.extends` spreads that define them.
    {
        rules: {
            'import/no-cycle': 'off', // <-- Disabling the most common cause of hangs

            'import/order': [
                'error',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'type',
                        'index',
                        'object',
                    ],
                    pathGroups: [
                        {
                            pattern: '@/**',
                            group: 'internal',
                        },
                        {
                            pattern: 'vite*',
                            group: 'external',
                            position: 'before',
                        },
                        {
                            pattern: 'react*',
                            group: 'external',
                            position: 'before',
                        },
                    ],
                    pathGroupsExcludedImportTypes: ['builtin', 'object'],
                },
            ],

            'import/extensions': [
                'error',
                {
                    js: 'never',
                    jsx: 'never',
                    ts: 'never',
                    tsx: 'never',
                    svg: 'always',
                    png: 'always',
                    jpg: 'always',
                    types: 'always',
                    wrapper: 'always',
                    utils: 'always',
                    styles: 'always',
                },
            ],
        },
    },
];
