'use strict';

module.exports = function (grunt) {

  require('time-grunt')(grunt);

  var path = require('path'),
    
    MIN_HEADER = '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.authors.join(", ") %>\n' +
      ' Licensed <%= pkg.license %> */',

    MAIN_HEADER = MIN_HEADER +
      '\n\n(function (window, angular) {\n' +
      '  \'use strict\';\n\n',

    pkg = grunt.file.readJSON('bower.json');

  require('load-grunt-config')(grunt, {
    configPath: path.join(__dirname, 'tasks'),
    data: {
      pkg: pkg,
      min: path.basename(pkg.main, '.js') + '.min.js',
      banner: MAIN_HEADER,
      banner_min: MIN_HEADER,
      footer: '})(window, window.angular);',
      lib_files: [
        './lib/tags.module.js',
        './lib/*.js'
      ],
      test_files: [
        './test/*.spec.js'
      ],
      test_deps: [
        './test/support/jquery/dist/jquery.js',
        './test/support/angular/angular.js',
        './test/support/angular-mocks/angular-mocks.js',
        './test/support/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
        './test/support/angular-debaser/debaser.js'
      ]
    }
  });


};
