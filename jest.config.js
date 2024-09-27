module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          baseUrl: './',
          paths: {
            '@app': ['./src/app'],
            '@src/*': ['./src/*'],
            '@controllers/*': ['./src/controllers/*'],
            '@routes/*': ['./src/routes/*'],
            '@middlewares/*': ['./src/middlewares/*'],
            '@utils/*': ['./src/utils/*'],
            '@typing/*': ['./src/types/*'],
          },
        },
      },
    ],
  },
};

