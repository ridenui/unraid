module.exports = {
    root: true,
    extends: ['airbnb-base', 'plugin:prettier/recommended', 'plugin:@typescript-eslint/recommended'],
    env: {
        node: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        parser: '@babel/eslint-parser',
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin', 'import', 'simple-import-sort'],
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.ts'],
            },
        },
    },
    rules: {
        'import/prefer-default-export': 'off',
        'no-console': 'off',
        'no-shadow': 'off',
        'no-param-reassign': 'off',
        '@typescript-eslint/no-shadow': ['error'],
        '@typescript-eslint/no-use-before-define': ['error'],
        'no-plusplus': 'off',
        'no-restricted-syntax': 'off',
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                js: 'never',
                jsx: 'never',
                ts: 'never',
                tsx: 'never',
            },
        ],
        'import/order': 'off',
        'simple-import-sort/exports': ['error'],
        'simple-import-sort/imports': [
            'error',
            {
                groups: [
                    [
                        '^\\u0000',
                        '^@?\\w',
                        // Internal packages.
                        '^(components|modules|utils)(/.*|$)',
                        // Parent imports. Put `..` last.
                        '^\\.\\.(?!/?$)',
                        '^\\.\\./?$',
                        // Other relative imports. Put same-folder imports and `.` last.
                        '^\\./(?=.*/)(?!/?$)',
                        '^\\.(?!/?$)',
                        '^\\./?$',
                    ],
                ],
            },
        ],
    },
};
