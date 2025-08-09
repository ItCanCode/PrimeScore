export default {
  testEnvironment: 'jsdom',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './', // where to put junit.xml
        outputName: 'junit.xml',
        classNameTemplate: '{filepath}',
        titleTemplate: '{title}',
      },
    ],
  ],
};
