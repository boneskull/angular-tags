'use strict';

module.exports = function (grunt) {

  require('time-grunt')(grunt);

  var path = require('path'),

    pkg = grunt.file.readJSON('package.json');

  require('load-grunt-config')(grunt, {
    configPath: path.join(__dirname, 'tasks'),
    data: {
      pkg: pkg,
      min: path.basename(pkg.main, '.js') + '.min.js',
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
      '* Licensed <%= pkg.license %>\n' +
      '*/',
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
