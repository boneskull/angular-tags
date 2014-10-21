'use strict';

module.exports = function jshint() {
  return {
    options: {
      reporter: require('jshint-stylish'),
      jshintrc: true
    },
    lib_test: [
      'lib/*.js',
      './test/*.spec.js'
    ],
    task: [
      './Gruntfile.js',
      './tasks/**/*.js'
    ]
  };
};
