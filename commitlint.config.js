export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'body-min-lines': ({ body }) => {
          const lines = body ? body.split('\n').filter((l) => l.trim()).length : 0;
          return [lines >= 2, 'body must have at least 2 non-empty lines'];
        },
      },
    },
  ],
  rules: {
    'subject-empty': [2, 'never'],
    'body-min-lines': [2, 'always'],
  },
};
